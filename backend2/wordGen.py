from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import InMemorySaver
import datetime

load_dotenv()

def wordgenerator(field):
    history = {}
    user_daily_count = {}  
    checkpointer = InMemorySaver()

    prompt = """
    # Role
    You are a professional language assistant that helps people understand commonly used professional and technical terms in workplace discussions and meetings.
    Your task is to generate exactly 2 commonly used terminologies and 3 phrases in the given field {field}. 

    For each term, provide the following details in JSON format:
    #if phrase 
    1. Phrase: <phrase>.
    2. Simple Meaning: A beginner-friendly, easy-to-understand explanation in plain English.
    3. Example Usage 1: A short realistic sentence showing how it is used in a professional conversation or meeting.
    4. Example Usage 2: Another sentence showing its typical usage in a professional context.
    5. Example Usage 3: Another example sentence in a workplace tone.
    #if term
    1. Term: <term>.
    2. Simple Meaning: A beginner-friendly, easy-to-understand explanation in plain English.
    3. Example Usage 1: A short realistic sentence showing how it is used in a professional conversation or meeting.
    4. Example Usage 2: Another sentence showing its typical usage in a professional context.
    5. Example Usage 3: Another example sentence in a workplace tone.
    # Instructions:
    - Keep the language simple and clear so that even a beginner in {field} can understand.
    - Ensure the 3 phrases are realistic for discussions or meetings, and the 2 technical terms are common and essential to the field.
    - Provide exactly 5 unique entries.
    - Make sure the answer is **strictly in JSON format**, with each entry as an object in an array.
    - 3 phrases are mandatory
    - No extra Tags needed like "I hope this helps! Let me know if you need anything further".
    - Do not use tags like Here are the 2 technical terms and 3 phrases in IT Management and computer science:
    - No additional data is required
    Field: {field}
    """

    client = init_chat_model("llama3-8b-8192", model_provider="groq")

    agent = create_react_agent(
        model=client,
        tools=[],
        prompt=prompt,
        checkpointer=checkpointer
    )

# Limit check logic
# def can_generate(thread_id):
#     today = datetime.date.today().isoformat()
#     record = user_daily_count.get(thread_id)

#     if record:
#         if record["date"] == today:
#             if record["count"] >= 5:
#                 return False  # Limit reached
#             else:
#                 user_daily_count[thread_id]["count"] += 1
#                 return True
#         else:
#             user_daily_count[thread_id] = {"date": today, "count": 1}
#             return True
#     else:
#         user_daily_count[thread_id] = {"date": today, "count": 1}
#         return True


    thread_id = "1"  

    config = {"configurable": {"thread_id": thread_id}}
    n = 0

    history[thread_id] = [] 

    response = agent.invoke(
            {"messages": [{"role": "user", "content": prompt.format(field=field)}]},
            config
            )
    term_output = response["messages"][-1].content
    history[thread_id].append(term_output)
    return term_output