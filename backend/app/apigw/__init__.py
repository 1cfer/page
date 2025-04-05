from flask import Blueprint

bp = Blueprint('apigw', __name__)

# This is necessary to avoid circular imports
from app.apigw import routes
