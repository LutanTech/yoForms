from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import base64, json, requests
from flask_migrate import Migrate
import string
import secrets
from datetime import datetime, timedelta
import base64, json
from sqlalchemy.dialects.sqlite import JSON


def generate_rand_id(length):
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///builder.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app,db)

# Models
class User(db.Model):
    id = db.Column(db.String, primary_key=True, default=generate_rand_id(10))
    name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(hours=3))
    is_active = db.Column(db.Boolean(), default=True)
    is_premium = db.Column(db.Boolean(), default=False)


    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone_number': self.phone_number,
            'email': self.email,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'i_a':self.is_active,
            'i_p':self.is_premium,
        }


class PublishedForm(db.Model):
    id = db.Column(db.String, primary_key=True, default=generate_rand_id(10))
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.String, db.ForeignKey('user.id'), nullable=False)
    html = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(hours=3))

    def to_dict(self):
        user = User.query.get(self.user_id)
        return {
            'id': self.id,
            'name': self.name,
            'phone': user.phone_number,
            'html': self.html,
            'created_at': self.created_at.strftime('%Y-%m-%d  %H:%M:%S')
        }
    
class Log(db.Model):
    id = db.Column(db.String(), primary_key=True, default=generate_rand_id(15))
    form_id = db.Column(db.String())
    user_id = db.Column(db.String(), db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(hours=3))

    def to_dict(self):
        return{
            'id':self.id,
            'form_id':self.form_id,
            'created':self.created_at
        }


class FormSubmission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(), nullable=False)
    data = db.Column(JSON, nullable=False)  
    form_id = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(hours=3))

    def to_dict(self):
        form = PublishedForm.query.filter_by(id=self.form_id).first()
        name = ''
        if form:
            name = form.name
        else:
            name = 'Unknown Form'
        return {
            "id": self.id,
            "user_id": self.user_id,
            "form": name,
            "data": self.data,
            "timestamp": self.timestamp.isoformat()
        }

def generate_blob(id):
    payload = {
        "id": id,
        "exp": (datetime.utcnow() + timedelta(hours=24)).timestamp()
    }
    blob = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    return blob

def validate_blob(blob, expected_id):
    try:
        decoded = base64.urlsafe_b64decode(blob.encode()).decode()
        data = json.loads(decoded)
        if data['id'] != expected_id:
            return False
        if datetime.utcnow().timestamp() > data['exp']:
            return False
        return True
    except Exception:
        return False

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    phone_number = data.get('phone')
    email = data.get('email')
    password = data.get('password')

    if not name or not phone_number or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400

    if User.query.filter((User.email == email) | (User.phone_number == phone_number)).first():
        return jsonify({'error': 'Email or phone already registered'}), 409

    hashed_password = generate_password_hash(password)

    new_user = User(
        name=name,
        phone_number=phone_number,
        email=email,
        password=hashed_password
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully 🔐', 'user': new_user.to_dict()})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    blob = generate_blob(user.id)
    return jsonify({'message': 'Login successful 🟢', 'blob':blob, 'id':user.id})

@app.route('/api/save-form', methods=['POST'])
def save_form():
    data = request.get_json()
    user_id = data.get('user_id')
    html = data.get('html')
    name = data.get('name')
    print('data===================', user_id, name)

    if not user_id or not html or not name:
        return jsonify({'error': 'Missing details'}), 400

    form = PublishedForm(id=generate_rand_id(10),user_id=user_id, html=html, name=name)
    db.session.add(form)
    db.session.commit()
    return jsonify({'message': 'Form saved', 'form': form.to_dict()})

@app.route('/api/get-form/<form_id>', methods=['GET'])
def get_form(form_id):
    form = PublishedForm.query.get(form_id)
    if not form:
        return jsonify({'error': 'Form not found'}), 404
    return jsonify({'form': form.to_dict()})

@app.route('/api/user-forms/<user_id>', methods=['GET'])
def get_user_forms(user_id):
    user=User.query.get(user_id)
    if user:
        if user.is_active:
          forms = PublishedForm.query.filter_by(user_id=user_id).all()
          return jsonify({'forms': [f.to_dict() for f in forms], 'user':user.to_dict()}), 200
        return jsonify({'error':'Account is not active. Please contact support'}), 401
    return jsonify({'error':'User not found'}), 404

@app.route('/api/account')
def account():
    data = request.get_json()
    blob = data.get('blob')
    id = data.get('id')
    if not id or not blob or not validate_blob(blob, id):
        return jsonify({'error': 'Unauthorized or expired session'}), 401
    user = User.query.get(id)
    if user:
        forms = get_user_forms(user.id)
        return jsonify({'user': user.to_dict(),'forms':forms})
    return jsonify({'error':'User not found'}), 400

@app.route('/log/<string:id>/<string:format>')
def log(id, format):
    if id:
        form = PublishedForm.query.get(id)
        if form:
           new_log = Log(id=generate_rand_id(15),form_id=id, user_id=form.user_id)
           try:
               db.session.add(new_log)
               db.session.commit()
               return jsonify({'status':'200'}), 200
           except Exception as e:
               db.session.rollback()
               return jsonify({'error':f'database said no this way: {str(e)}'}), 500
        return jsonify({'error':'user une verificando'}), 404
    return jsonify({'error':'missing fields'}), 404
    

@app.route('/get_logs/<string:user_id>', methods=['GET'])
def get_logs(user_id):
    try:
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if not user.is_premium:
            return jsonify({'error': 'Non-Premium User'}), 401

        filter_type = request.args.get('return', 'all')

        query = Log.query.filter_by(user_id=user_id)

        now = datetime.utcnow()
        if filter_type == 'last7':
            query = query.filter(Log.timestamp >= now - timedelta(days=7))
        elif filter_type == 'last30':
            query = query.filter(Log.timestamp >= now - timedelta(days=30))

        logs = query.all()

        if not logs:
            return jsonify({'logs': [], 'message': 'No logs found.'}), 200

        return jsonify({'logs': [log.to_dict() for log in logs]}), 200

    except Exception as e:
        print(f"Error fetching logs for User {user_id}: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@app.route('/api/save-submission', methods=['POST'])
def save_submission():
    try:
        req = request.get_json()
        form_id = req.get('form_id')
        data = req.get('data')
        form = PublishedForm.query.filter_by(id=form_id).first()
        user_id = form.user_id

        if not user_id or not form_id or not data:
            return jsonify({'error': 'Missing user_id, form_id or data'}), 400

        new_entry = FormSubmission(user_id=user_id, form_id=form_id, data=data)
        db.session.add(new_entry)
        db.session.commit()

        return jsonify({'message': 'Submission saved successfully! 🔥'}), 201

    except Exception as e:
        print(f"Error saving submission: {e}")
        return jsonify({'error': 'Server error while saving submission'}), 500

@app.route('/api/get-submissions/<user_id>')
def get_submissions(user_id):
    subs = FormSubmission.query.filter_by(user_id=user_id).order_by(FormSubmission.timestamp.desc()).all()
    return jsonify({
        'submissions': [s.to_dict() for s in subs  ]
    })

@app.route('/api/delete_form/<string:form_id>/<string:user_id>', methods=['GET'])
def delete_form(form_id, user_id):
    if not user_id:
        return jsonify({'error': 'Missing user ID'}), 400

    form = PublishedForm.query.filter_by(id=form_id).first()

    if not form:
        return jsonify({'error': 'Form not found'}), 404

    if form.user_id != user_id:
        return jsonify({'error': 'You do not have permission to delete this form'}), 401

    try:
        if delete_logs(form.id): 
            db.session.delete(form)
            db.session.commit()
            return jsonify({'msg': 'Form deleted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to delete associated logs'}), 500

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'A database error occurred: {str(e)}'}), 500


def delete_logs(form_id):
    if not form_id:
        return False

    try:
        logs = Log.query.filter_by(form_id=form_id).all()
        if not logs:
            return True 
        for log in logs:
            db.session.delete(log)

        db.session.commit() 
        return True

    except Exception as e:
        db.session.rollback()
        print(f'Error deleting logs: {e}')
        return False

@app.route('/api/get_form/<form_id>', methods=['GET'])
def get_published_form(form_id):
    form = PublishedForm.query.get(form_id)
    if not form:
        return jsonify({'error': 'Form not found'}), 404

    return jsonify(form.to_dict()), 200

@app.route('/api/update_form/<form_id>', methods=['POST'])
def update_published_form(form_id):
    data = request.get_json()
    name = data.get('name')
    html = data.get('html')

    if not name or not html:
        return jsonify({'error': 'Missing name or HTML'}), 400

    form = PublishedForm.query.get(form_id)
    if not form:
        return jsonify({'error': 'Form not found'}), 404

    form.name = name
    form.html = html
    db.session.commit()

    return jsonify({'message': 'Form updated successfully'}), 200

if __name__ == '__main__':
    with app.app_context():
       db.create_all()
    app.run(debug=True)
