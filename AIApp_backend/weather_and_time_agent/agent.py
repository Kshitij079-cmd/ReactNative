import datetime
from zoneinfo import ZoneInfo
from google.adk.agents import Agent # type: ignore

# Demo cities with their timezone and weather data
DEMO_CITIES = {
    "new york": {
        "timezone": "America/New_York",
        "weather": "Partly cloudy with a temperature of 22°C (72°F). Humidity: 65%"
    },
    "london": {
        "timezone": "Europe/London", 
        "weather": "Rainy with a temperature of 15°C (59°F). Humidity: 80%"
    },
    "tokyo": {
        "timezone": "Asia/Tokyo",
        "weather": "Sunny with a temperature of 28°C (82°F). Humidity: 70%"
    },
    "sydney": {
        "timezone": "Australia/Sydney",
        "weather": "Clear skies with a temperature of 18°C (64°F). Humidity: 55%"
    },
    "paris": {
        "timezone": "Europe/Paris",
        "weather": "Overcast with a temperature of 12°C (54°F). Humidity: 75%"
    },
    "mumbai": {
        "timezone": "Asia/Kolkata",
        "weather": "Hot and humid with a temperature of 32°C (90°F). Humidity: 85%"
    },
    "dubai": {
        "timezone": "Asia/Dubai",
        "weather": "Very hot and dry with a temperature of 38°C (100°F). Humidity: 30%"
    },
    "singapore": {
        "timezone": "Asia/Singapore",
        "weather": "Thunderstorms with a temperature of 30°C (86°F). Humidity: 90%"
    }
}

def get_weather(city: str) -> dict:
    """Get weather information for a demo city"""
    city_lower = city.lower()
    
    if city_lower in DEMO_CITIES:
        return {
            "status": "success",
            "city": city,
            "weather": DEMO_CITIES[city_lower]["weather"],
            "report": f"The weather in {city.title()} is {DEMO_CITIES[city_lower]['weather']}."
        }
    else:
        available_cities = ", ".join([city.title() for city in DEMO_CITIES.keys()])
        return {
            "status": "error",
            "error_message": f"Weather information for '{city}' is not available. Available cities: {available_cities}",
        }
    
def get_current_time(city: str) -> dict:
    """Get current time for a demo city"""
    city_lower = city.lower()
    
    if city_lower in DEMO_CITIES:
        tz_identifier = DEMO_CITIES[city_lower]["timezone"]
        tz = ZoneInfo(tz_identifier)
        now = datetime.datetime.now(tz)
        formatted_time = now.strftime("%Y-%m-%d %H:%M:%S %Z")
        
        return {
            "status": "success", 
            "city": city,
            "timezone": tz_identifier,
            "current_time": formatted_time,
            "report": f"The current time in {city.title()} is {formatted_time}"
        }
    else:
        available_cities = ", ".join([city.title() for city in DEMO_CITIES.keys()])
        return {
            "status": "error",
            "error_message": f"Sorry, I don't have timezone information for {city}. Available cities: {available_cities}",
        }

def get_city_info(city: str) -> dict:
    """Get both weather and time information for a demo city"""
    city_lower = city.lower()
    
    if city_lower in DEMO_CITIES:
        weather_result = get_weather(city)
        time_result = get_current_time(city)
        
        if weather_result["status"] == "success" and time_result["status"] == "success":
            return {
                "status": "success",
                "city": city.title(),
                "weather": weather_result["weather"],
                "current_time": time_result["current_time"],
                "timezone": time_result["timezone"],
                "report": f"{weather_result['report']} {time_result['report']}"
            }
    
    available_cities = ", ".join([city.title() for city in DEMO_CITIES.keys()])
    return {
        "status": "error",
        "error_message": f"Information for '{city}' is not available. Available cities: {available_cities}",
    }

root_agent = Agent(
    name="weather_time_agent",
    model="gemini-2.0-flash-exp",
    description=(
        "Agent to answer questions about the time and weather in demo cities including "
        "New York, London, Tokyo, Sydney, Paris, Mumbai, Dubai, and Singapore."
    ),
    instruction=(
        "You are a helpful agent who can answer user questions about the time and weather "
        "in demo cities. You can provide current time, weather conditions, and timezone information "
        "for New York, London, Tokyo, Sydney, Paris, Mumbai, Dubai, and Singapore. "
        "When asked about a city, provide both weather and time information if possible."
    ),
    tools=[get_weather, get_current_time, get_city_info],
)