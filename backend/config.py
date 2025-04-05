import os
from dotenv import load_dotenv

if (os.getenv('ENVIRONMENT') != 'production'):
    # Load environment variables from .env file
    # This is useful for local development
    # Make sure to create a .env file with the required variables
    # and add it to your .gitignore file
  load_dotenv()

class Config:
  SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI')
  SECRET_KEY = os.getenv('SECRET_KEY')
  JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
  SQLALCHEMY_TRACK_MODIFICATIONS = False
