from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///runs.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Run(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    date = db.Column(db.DateTime, nullable=False)
    distance = db.Column(db.Float, nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # in seconds
    average_pace = db.Column(db.Float, nullable=False)  # minutes per km
    route = db.Column(db.JSON, nullable=False)  # Array of {lat, lng} objects

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'distance': self.distance,
            'duration': self.duration,
            'averagePace': self.average_pace,
            'route': self.route
        }

# Create tables
with app.app_context():
    db.create_all()

@app.route('/api/runs', methods=['GET'])
def get_runs():
    runs = Run.query.order_by(Run.date.desc()).all()
    return jsonify([run.to_dict() for run in runs])

@app.route('/api/runs/<run_id>', methods=['GET'])
def get_run(run_id):
    run = Run.query.get_or_404(run_id)
    return jsonify(run.to_dict())

@app.route('/api/runs', methods=['POST'])
def create_run():
    data = request.json

    # Validate minimum distance
    if data.get('distance', 0) < 0.01:
        return jsonify({'error': 'Run distance is too short'}), 400

    # Validate route points
    route = data.get('route', [])
    if len(route) < 2:
        return jsonify({'error': 'Not enough GPS points recorded'}), 400

    new_run = Run(
        id=data['id'],
        date=datetime.fromisoformat(data['date']),
        distance=data['distance'],
        duration=data['duration'],
        average_pace=data['averagePace'],
        route=data['route']
    )

    try:
        db.session.add(new_run)
        db.session.commit()
        return jsonify(new_run.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/runs/<run_id>', methods=['DELETE'])
def delete_run(run_id):
    run = Run.query.get_or_404(run_id)
    try:
        db.session.delete(run)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    runs = Run.query.all()
    
    if not runs:
        return jsonify({
            'totalRuns': 0,
            'totalDistance': 0,
            'totalDuration': 0,
            'averagePace': 0,
            'longestRun': 0,
            'fastestPace': 0
        })

    total_distance = sum(run.distance for run in runs)
    total_duration = sum(run.duration for run in runs)
    longest_run = max(run.distance for run in runs)
    fastest_pace = min(run.average_pace for run in runs)

    return jsonify({
        'totalRuns': len(runs),
        'totalDistance': total_distance,
        'totalDuration': total_duration,
        'averagePace': total_duration / total_distance / 60 if total_distance > 0 else 0,
        'longestRun': longest_run,
        'fastestPace': fastest_pace
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
