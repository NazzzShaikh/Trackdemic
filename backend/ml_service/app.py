"""
Flask microservice for ML operations
"""
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle
import os

app = Flask(__name__)

# Load or create ML models
MODEL_PATH = 'models/'
os.makedirs(MODEL_PATH, exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'ML Service'})

@app.route('/predict/performance', methods=['POST'])
def predict_performance():
    """Predict student performance based on learning data"""
    try:
        data = request.json
        # Extract features from student data
        features = np.array([[
            data.get('quiz_scores', 0),
            data.get('assignment_scores', 0),
            data.get('attendance', 0),
            data.get('time_spent', 0),
            data.get('course_difficulty', 0)
        ]])
        
        # Load or create a simple model
        model_file = os.path.join(MODEL_PATH, 'performance_model.pkl')
        if os.path.exists(model_file):
            with open(model_file, 'rb') as f:
                model = pickle.load(f)
        else:
            # Create a dummy model for demonstration
            model = RandomForestClassifier(n_estimators=10, random_state=42)
            # Train with dummy data
            X_dummy = np.random.rand(100, 5)
            y_dummy = np.random.randint(0, 3, 100)  # 0: Poor, 1: Average, 2: Good
            model.fit(X_dummy, y_dummy)
            
            with open(model_file, 'wb') as f:
                pickle.dump(model, f)
        
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0]
        
        performance_labels = ['Poor', 'Average', 'Good']
        
        return jsonify({
            'prediction': performance_labels[prediction],
            'confidence': float(max(probability)),
            'probabilities': {
                label: float(prob) for label, prob in zip(performance_labels, probability)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommend/courses', methods=['POST'])
def recommend_courses():
    """Recommend courses based on student preferences and performance"""
    try:
        data = request.json
        student_interests = data.get('interests', [])
        performance_history = data.get('performance', {})
        
        # Simple recommendation logic (can be enhanced with collaborative filtering)
        recommendations = []
        
        # Mock course data
        courses = [
            {'id': 1, 'name': 'Python Programming', 'difficulty': 'Beginner', 'category': 'Programming'},
            {'id': 2, 'name': 'Data Science', 'difficulty': 'Intermediate', 'category': 'Data'},
            {'id': 3, 'name': 'Machine Learning', 'difficulty': 'Advanced', 'category': 'AI'},
            {'id': 4, 'name': 'Web Development', 'difficulty': 'Beginner', 'category': 'Programming'},
            {'id': 5, 'name': 'Database Design', 'difficulty': 'Intermediate', 'category': 'Database'},
        ]
        
        # Filter courses based on interests and performance
        for course in courses:
            score = 0
            if course['category'].lower() in [interest.lower() for interest in student_interests]:
                score += 0.5
            
            # Adjust based on performance
            avg_performance = sum(performance_history.values()) / len(performance_history) if performance_history else 0.5
            if course['difficulty'] == 'Beginner' and avg_performance < 0.6:
                score += 0.3
            elif course['difficulty'] == 'Intermediate' and 0.6 <= avg_performance < 0.8:
                score += 0.3
            elif course['difficulty'] == 'Advanced' and avg_performance >= 0.8:
                score += 0.3
            
            if score > 0:
                recommendations.append({
                    'course': course,
                    'score': score,
                    'reason': f"Matches your interests in {course['category']}"
                })
        
        # Sort by score
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify({
            'recommendations': recommendations[:5],  # Top 5 recommendations
            'total': len(recommendations)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
