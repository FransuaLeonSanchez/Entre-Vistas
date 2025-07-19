import os
from openai import OpenAI
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

text = "La inteligencia artificial está revolucionando la forma en que interactuamos con la tecnología, desde asistentes virtuales hasta vehículos autónomos. Esta transformación digital promete cambiar radicalmente nuestra sociedad en las próximas décadas."

speech_file_path = Path(__file__).parent / "speech.mp3"

response = client.audio.speech.create(
  model="tts-1",
  voice="alloy",
  input=text
)

response.stream_to_file(speech_file_path)

print(f"Audio guardado en: {speech_file_path}") 