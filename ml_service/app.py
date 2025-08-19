from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, accuracy_score
import joblib
import os
from datetime import datetime, timedelta
import sqlite3

app = Flask(__name__)

# ML Models storage
models = {}
scalers = {}

def get_db_connection():
    """Get database connection to Django SQLite database"""
    db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'db.sqlite3')
    return sqlite3.connect(db_path)

def load_student_performance_data():
    """Load student performance data from Django database"""
    conn = get_db_connection()
    
    # Query to get student performance data
    query = """
    SELECT 
        u.id as student_id,
        u.date_joined,
        COUNT(DISTINCT e.course_id) as courses_enrolled,
        COUNT(DISTINCT qa.quiz_id) as quizzes_taken,
        AVG(qa.score) as avg_quiz_score,
        COUNT(qa.id) as total_attempts,
        AVG(qa.time_taken) as avg_time_taken,
        MAX(qa.created_at) as last_activity
    FROM auth_user u
    LEFT JOIN courses_enrollment e ON u.id = e.student_id
    LEFT JOIN quizzes_quizattempt qa ON u.id = qa.student_id
    WHERE u.user_type = 'student'
    GROUP BY u.id
    """
    
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    # Fill NaN values
    df = df.fillna(0)
    
    # Convert dates
    df['date_joined'] = pd.to_datetime(df['date_joined'])
    df['last_activity'] = pd.to_datetime(df['last_activity'])
    
    # Calculate days since joining and last activity
    now = datetime.now()
    df['days_since_joining'] = (now - df['date_joined']).dt.days
    df['days_since_last_activity'] = (now - df['last_activity']).dt.days
    df['days_since_last_activity'] = df['days_since_last_activity'].fillna(999)  # For students with no activity
    
    return df

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/analyze/student-performance', methods=['POST'])
def analyze_student_performance():
    """Analyze individual student performance and provide insights"""
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'error': 'student_id is required'}), 400
        
        # Load performance data
        df = load_student_performance_data()
        student_data = df[df['student_id'] == student_id]
        
        if student_data.empty:
            return jsonify({'error': 'Student not found'}), 404
        
        student = student_data.iloc[0]
        
        # Calculate performance metrics
        performance_score = calculate_performance_score(student)
        engagement_level = calculate_engagement_level(student)
        risk_level = calculate_risk_level(student)
        recommendations = generate_recommendations(student)
        
        # Compare with peers
        peer_comparison = compare_with_peers(student, df)
        
        analysis = {
            'student_id': int(student_id),
            'performance_score': float(performance_score),
            'engagement_level': engagement_level,
            'risk_level': risk_level,
            'metrics': {
                'courses_enrolled': int(student['courses_enrolled']),
                'quizzes_taken': int(student['quizzes_taken']),
                'avg_quiz_score': float(student['avg_quiz_score']),
                'total_attempts': int(student['total_attempts']),
                'avg_time_taken': float(student['avg_time_taken']),
                'days_since_joining': int(student['days_since_joining']),
                'days_since_last_activity': int(student['days_since_last_activity'])
            },
            'peer_comparison': peer_comparison,
            'recommendations': recommendations,
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/performance', methods=['POST'])
def predict_performance():
    """Predict student performance using ML models"""
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        
        # Load and prepare data
        df = load_student_performance_data()
        
        if len(df) < 10:  # Need minimum data for ML
            return jsonify({'error': 'Insufficient data for prediction'}), 400
        
        # Prepare features for ML
        features = ['courses_enrolled', 'quizzes_taken', 'total_attempts', 
                   'avg_time_taken', 'days_since_joining', 'days_since_last_activity']
        
        X = df[features].fillna(0)
        y = df['avg_quiz_score'].fillna(0)
        
        # Train model if not exists
        if 'performance_predictor' not in models:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train Random Forest model
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train_scaled, y_train)
            
            # Store model and scaler
            models['performance_predictor'] = model
            scalers['performance_scaler'] = scaler
            
            # Calculate model accuracy
            y_pred = model.predict(X_test_scaled)
            mse = mean_squared_error(y_test, y_pred)
            models['performance_predictor_mse'] = mse
        
        # Make prediction for specific student
        if student_id:
            student_data = df[df['student_id'] == student_id]
            if not student_data.empty:
                student_features = student_data[features].iloc[0:1]
                student_features_scaled = scalers['performance_scaler'].transform(student_features)
                predicted_score = models['performance_predictor'].predict(student_features_scaled)[0]
                
                return jsonify({
                    'student_id': int(student_id),
                    'predicted_performance': float(predicted_score),
                    'current_performance': float(student_data['avg_quiz_score'].iloc[0]),
                    'model_accuracy': float(models.get('performance_predictor_mse', 0)),
                    'prediction_timestamp': datetime.now().isoformat()
                })
        
        # Return general model info
        return jsonify({
            'model_trained': True,
            'model_accuracy': float(models.get('performance_predictor_mse', 0)),
            'training_samples': len(df),
            'features_used': features
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analytics/class-insights', methods=['POST'])
def get_class_insights():
    """Get class-level analytics and insights"""
    try:
        data = request.get_json()
        course_id = data.get('course_id')
        
        conn = get_db_connection()
        
        # Query for course-specific data
        if course_id:
            query = """
            SELECT 
                u.id as student_id,
                u.first_name,
                u.last_name,
                COUNT(qa.id) as quiz_attempts,
                AVG(qa.score) as avg_score,
                MAX(qa.score) as best_score,
                AVG(qa.time_taken) as avg_time,
                COUNT(DISTINCT qa.quiz_id) as unique_quizzes
            FROM auth_user u
            JOIN courses_enrollment e ON u.id = e.student_id
            LEFT JOIN quizzes_quizattempt qa ON u.id = qa.student_id
            LEFT JOIN quizzes_quiz q ON qa.quiz_id = q.id
            WHERE e.course_id = ? AND u.user_type = 'student'
            GROUP BY u.id
            """
            df = pd.read_sql_query(query, conn, params=[course_id])
        else:
            # Overall class insights
            query = """
            SELECT 
                u.id as student_id,
                COUNT(qa.id) as quiz_attempts,
                AVG(qa.score) as avg_score,
                MAX(qa.score) as best_score,
                AVG(qa.time_taken) as avg_time
            FROM auth_user u
            LEFT JOIN quizzes_quizattempt qa ON u.id = qa.student_id
            WHERE u.user_type = 'student'
            GROUP BY u.id
            """
            df = pd.read_sql_query(query, conn)
        
        conn.close()
        
        if df.empty:
            return jsonify({'error': 'No data found'}), 404
        
        # Calculate insights
        insights = {
            'total_students': len(df),
            'average_score': float(df['avg_score'].mean()),
            'score_distribution': {
                'excellent': len(df[df['avg_score'] >= 90]),
                'good': len(df[(df['avg_score'] >= 70) & (df['avg_score'] < 90)]),
                'average': len(df[(df['avg_score'] >= 50) & (df['avg_score'] < 70)]),
                'needs_improvement': len(df[df['avg_score'] < 50])
            },
            'engagement_metrics': {
                'active_students': len(df[df['quiz_attempts'] > 0]),
                'avg_attempts_per_student': float(df['quiz_attempts'].mean()),
                'avg_time_per_quiz': float(df['avg_time'].mean())
            },
            'top_performers': df.nlargest(5, 'avg_score')[['student_id', 'avg_score']].to_dict('records'),
            'at_risk_students': df.nsmallest(5, 'avg_score')[['student_id', 'avg_score']].to_dict('records'),
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        return jsonify(insights)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_performance_score(student):
    """Calculate overall performance score (0-100)"""
    score = 0
    
    # Quiz performance (40%)
    if student['avg_quiz_score'] > 0:
        score += (student['avg_quiz_score'] / 100) * 40
    
    # Engagement (30%)
    engagement = min(student['courses_enrolled'] * 10 + student['quizzes_taken'] * 5, 30)
    score += engagement
    
    # Consistency (20%)
    if student['days_since_last_activity'] < 7:
        score += 20
    elif student['days_since_last_activity'] < 30:
        score += 10
    
    # Progress (10%)
    if student['total_attempts'] > 0:
        score += min(student['total_attempts'] * 2, 10)
    
    return min(score, 100)

def calculate_engagement_level(student):
    """Calculate engagement level"""
    if student['days_since_last_activity'] > 30:
        return 'Low'
    elif student['quizzes_taken'] < 2:
        return 'Low'
    elif student['quizzes_taken'] > 10 and student['days_since_last_activity'] < 7:
        return 'High'
    else:
        return 'Medium'

def calculate_risk_level(student):
    """Calculate risk level for dropout/failure"""
    risk_score = 0
    
    if student['avg_quiz_score'] < 50:
        risk_score += 3
    elif student['avg_quiz_score'] < 70:
        risk_score += 1
    
    if student['days_since_last_activity'] > 14:
        risk_score += 2
    
    if student['courses_enrolled'] == 0:
        risk_score += 2
    
    if risk_score >= 4:
        return 'High'
    elif risk_score >= 2:
        return 'Medium'
    else:
        return 'Low'

def generate_recommendations(student):
    """Generate personalized recommendations"""
    recommendations = []
    
    if student['avg_quiz_score'] < 70:
        recommendations.append("Focus on improving quiz performance through additional practice")
    
    if student['days_since_last_activity'] > 7:
        recommendations.append("Increase learning activity - try to engage with courses daily")
    
    if student['courses_enrolled'] < 2:
        recommendations.append("Consider enrolling in more courses to broaden your knowledge")
    
    if student['avg_time_taken'] > 0 and student['avg_time_taken'] < 300:  # Less than 5 minutes
        recommendations.append("Take more time to carefully read and understand quiz questions")
    
    if not recommendations:
        recommendations.append("Keep up the great work! Continue your current learning pace")
    
    return recommendations

def compare_with_peers(student, df):
    """Compare student performance with peers"""
    peer_avg_score = df['avg_quiz_score'].mean()
    peer_avg_courses = df['courses_enrolled'].mean()
    peer_avg_quizzes = df['quizzes_taken'].mean()
    
    return {
        'score_percentile': float((df['avg_quiz_score'] < student['avg_quiz_score']).mean() * 100),
        'courses_percentile': float((df['courses_enrolled'] < student['courses_enrolled']).mean() * 100),
        'quizzes_percentile': float((df['quizzes_taken'] < student['quizzes_taken']).mean() * 100),
        'peer_averages': {
            'avg_score': float(peer_avg_score),
            'avg_courses': float(peer_avg_courses),
            'avg_quizzes': float(peer_avg_quizzes)
        }
    }

if __name__ == '__main__':
    app.run(debug=True, port=5001)
