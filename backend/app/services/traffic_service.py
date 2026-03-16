from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User

class TrafficService:
    @staticmethod
    async def report_traffic(db: AsyncSession, server_id: int, user_id: int, u: int, d: int, multiplier: float = 1.0) -> bool:
        """
        Called by Edge Node Agents (like Xray/Mihomo) to report traffic usage.
        Calculates and deducts from user quota based on the node's traffic multiplier.
        """
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active or user.is_banned:
            return False
            
        calculated_u = int(u * multiplier)
        calculated_d = int(d * multiplier)
        
        user.u += calculated_u
        user.d += calculated_d
        
        # If they exceeded their limit, they shouldn't authenticate next time, 
        # but we record what they used now.
        
        await db.commit()
        return True
