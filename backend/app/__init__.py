from flask import Flask
from config import Config
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.extensions import db
from app.apigw import bp as apigw_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.config['CORS_HEADERS'] = 'Content-Type'

    # Initialize Flask extensions here
    db.init_app(app)
    Bcrypt(app)
    JWTManager(app)
    CORS(app)

    # Register blueprints here
    app.register_blueprint(apigw_bp, url_prefix='/api/v1')

    @app.route('/health-check', methods=['GET'])
    def health_check():
        """
        Health check endpoint to verify if the application is running.
        """
        return { 'status': 'success', 'message': 'API is running' }

    return app