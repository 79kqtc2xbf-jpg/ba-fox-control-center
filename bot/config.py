from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')

    telegram_bot_token: str
    telegram_owner_chat_id: Optional[int] = None

    google_sheet_id: str
    google_service_account_json: Optional[str] = None
    google_service_account_file: str = 'service-account.json'

    timezone: str = 'Asia/Bangkok'
    reminder_mode: str = 'combo'

    morning_prompt_time: str = '09:30'
    midday_check_time: str = '12:30'
    push_check_time: str = '15:30'
    evening_report_time: str = '19:30'


settings = Settings()
