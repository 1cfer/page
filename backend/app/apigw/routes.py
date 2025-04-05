from app.apigw import bp

@bp.route('/', methods=['GET'])
def index():
  """
  Health check endpoint to verify if the API Gateway is running.
  """
  return 'API Gateway is running!'
