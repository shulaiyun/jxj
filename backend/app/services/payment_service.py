import hashlib
from urllib.parse import urlencode

class EPayGateway:
    """
    Standard EPay (易支付) compatible API integration.
    Many third-party '免签' providers use this exact protocol.
    """
    
    def __init__(self, api_url: str, pid: str, key: str):
        self.api_url = api_url.rstrip('/')
        self.pid = pid
        self.key = key

    def generate_sign(self, param_dict: dict) -> str:
        """MD5 signature generation standard for Alipay/EPay clones."""
        keys = sorted(param_dict.keys())
        sign_string = "&".join(f"{k}={param_dict[k]}" for k in keys if k != "sign" and param_dict[k] != "")
        sign_string += self.key
        return hashlib.md5(sign_string.encode('utf-8')).hexdigest()

    def build_payment_link(self, trade_no: str, amount: float, name: str, notify_url: str, return_url: str) -> str:
        """Construct the URL to redirect the user to finish payment."""
        params = {
            "pid": self.pid,
            "type": "alipay", # Defaulting to alipay, could be wechat, unipay
            "out_trade_no": trade_no,
            "notify_url": notify_url,
            "return_url": return_url,
            "name": name,
            "money": f"{amount:.2f}"
        }
        params["sign"] = self.generate_sign(params)
        params["sign_type"] = "MD5"
        
        return f"{self.api_url}/submit.php?{urlencode(params)}"

    def verify_callback(self, callback_data: dict) -> bool:
        """Verify the signature of incoming webhooks to prevent spoofing."""
        provided_sign = callback_data.get("sign")
        if not provided_sign:
            return False
            
        expected_sign = self.generate_sign(callback_data)
        return expected_sign == provided_sign
