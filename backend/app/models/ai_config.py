from sqlalchemy import Column, Integer, String, Text, Boolean
from app.db.base_class import Base

class AIConfig(Base):
    """
    Configuration for the LLM AI Assistant system.
    """
    __tablename__ = "ai_configs"

    id = Column(Integer, primary_key=True, index=True)
    
    # 'openai', 'anthropic', 'gemini', 'custom'
    provider = Column(String(50), nullable=False) 
    
    # Model name, e.g., 'gpt-4-turbo', 'claude-3-opus'
    model_name = Column(String(100), nullable=False)
    
    api_key = Column(String(255), nullable=False)
    base_url = Column(String(255), nullable=True) # Custom reverse proxy endpoints
    
    system_prompt = Column(Text, nullable=True)
    
    is_active = Column(Boolean, default=False)
