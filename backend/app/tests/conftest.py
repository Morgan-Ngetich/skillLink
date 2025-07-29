import pytest
from sqlmodel import Session, SQLModel, create_engine
from app.core.config import settings

@pytest.fixture(scope="module")
def engine():
  # Crete engine once for the test module
  engine = create_engine(settings.TEST_DATABASE_URL)
  SQLModel.metadata.create_all(engine)
  yield engine
  
  SQLModel.metadata.drop_all(engine)
  # Dispose the engine to free resources.
  engine.dispose()

@pytest.fixture(scope="module")
def connection(engine):
  # Connect onec per module
  connection = engine.connect()
  yield connection
  
  # Close the connection after tests are done.
  connection.close()

@pytest.fixture(scope="function")
def session(connection):
  # Begin a nested transaction / savepoint
  # This allows rolling back changes made during the test without affecting others.
  transaction = connection.begin_nested()
  
  # Create a new SQLModel session bound to the existing connection.
  session = Session(bind=connection)
  yield session
  
  # Close the session after the test.
  session.close()
  # Roll back the nested transaction to undo all changes made during the test.
  transaction.rollback()

@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "securepassword",
    }
