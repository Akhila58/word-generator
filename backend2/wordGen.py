from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import InMemorySaver
import datetime


load_dotenv()


def wordgenerator(field:str):
    history = {}
    user_daily_count = {}  
    checkpointer = InMemorySaver()

    prompt = """
    # Role
    You are a professional language assistant that helps people understand commonly used professional and technical terms in workplace discussions and meetings.
    Your task is to generate exactly 3 commonly used terminologies and 3 phrases in the given field {field}. 
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


    
    thread_id = 1
    
    config = {"configurable": {"thread_id": thread_id}}
    n = 0
   
    history[thread_id] = [] 

    response = agent.invoke(
            {"messages": [{"role": "user", "content": prompt.format(field=field)}]},
            config
            )
    term_output = response["messages"][-1].content
    user_history = history[thread_id].append(term_output)
    return term_output


def quiz_generator(quiz_data):
    import json
    def normalize_entry(entry):
        key_map = {
            "phrase": "Phrase",
            "term": "Term",
            "simple meaning": "Simple Meaning",
            "example usage 1": "Example Usage 1",
            "example usage 2": "Example Usage 2",
            "example usage 3": "Example Usage 3"
        }
        return {key_map.get(k, k): v for k, v in entry.items()}

    # Normalize quiz_data before sending to agent
    if isinstance(quiz_data, dict):
        quiz_data_norm = [normalize_entry(quiz_data[k]) for k in sorted(quiz_data.keys(), key=lambda x: int(x))]
    elif isinstance(quiz_data, list):
        quiz_data_norm = [normalize_entry(item) for item in quiz_data]
    else:
        quiz_data_norm = quiz_data

    client = init_chat_model("llama3-8b-8192", model_provider="groq")
    prompt = """ 
        # Role
        You are a quiz generator assistant.  
        Your task is to create quiz questions ONLY from the given data {quiz_data}.  
        
        # Instructions:  
        1. Use the provided terms, phrases, meanings, and examples to generate tricky quiz questions.  
        2. Include two types of questions:  
        - **Fill-in-the-blank**: Replace the most important word/phrase with a blank (____).  
        - **Multiple-choice (MCQ)**: Provide 1 correct answer and 3 close but incorrect distractors based strictly on the given data.  
        3. Make the questions slightly tricky by:  
        - Rephrasing sentences.  
        - Using synonyms or similar concepts in options.  
        - Ensuring distractors look believable but are wrong.  
        4. Output exactly 5 questions in total (mix of blanks and MCQs).  
        5. The format should be strictly JSON, with each question as an object in an array. 
        6. Do not include any other tags like "I hope these questions meet your requirements! Let me know if you need any further assistance." 
            
        # Example
        Each object should follow this structure:  
        {{
        "Question": "<the quiz question text>",
        "Type": "Blank" | "MCQ",
        "Options": ["<option1>", "<option2>", "<option3>", "<option4>"]  // Only for MCQs
        "Answer": "<correct answer>"
        }}

        Rules:  
        - Do not invent anything outside the given data.  
        - Keep questions professional, clear, and relevant to the workplace.  
        - Ensure the answer is always explicitly present in the given data.  
        
    """
    agent = create_react_agent(
        model=client,
        tools=[],
        prompt=prompt,
    )
    response = agent.invoke(
            {"messages": [{"role": "user", "content": prompt.format(quiz_data=json.dumps(quiz_data_norm))}]})
    response_quiz_data = response["messages"][-1].content
    print(response_quiz_data)
    return response_quiz_data
    
    
if __name__ == "__main__":
    # result = wordgenerator("computer science")
    # print(result)
    
    generated_data = {"0": {"example usage 1": "The team lead suggested we prototype this feature to see if it's feasible before investing too much time.", "example usage 2": "We need to prototype this new algorithm to ensure it's efficient before implementing it in the production code.", "example usage 3": "The developer is going to prototype the user interface to get feedback from the stakeholders before finalizing the design.", "phrase": "Let's prototype this feature", "simple meaning": "This means to create a simple, basic version of something to test and see if it works."}, "1": {"example usage 1": "The developer asked me to debug this issue and find the cause of the error.", "example usage 2": "The team is trying to debug this complex bug that's been causing issues in the production environment.", "example usage 3": "I'll debug this code and see if I can find the problem, it's been giving me strange errors all day.", "phrase": "Can you debug this issue?", "simple meaning": "This means to identify and fix the problem in the code that is causing it to not work correctly."}, "2": {"example usage 1": "The data scientist said that this algorithm is scalable, so we can use it to process large data sets.", "example usage 2": "The company is using a scalable algorithm to handle the increasing traffic on their website.", "example usage 3": "We need to find a scalable solution for this problem, otherwise it will become too slow with too many users.", "phrase": "This algorithm is scalable", "simple meaning": "This means that the algorithm can handle a large amount of data or a large number of users without slowing down or becoming inefficient."}, "3": {"example usage 1": "The company provides an API for developers to access and use their data in their applications.", "example usage 2": "The team is building an API to integrate with the new payment gateway.", "example usage 3": "The API documentation is very extensive, but it's worth the effort to understand it.", "term": "API", "simple meaning": "This stands for Application Programming Interface, which is a set of rules that allows different software systems to communicate with each other."}, "4": {"example usage 1": "The company uses a database to store customer information and order data.", "example usage 2": "The team is designing a database to store the vast amount of data generated by the sensors.", "example usage 3": "The database administrator is responsible for ensuring the security and integrity of the data.", "term": "Database", "simple meaning": "This is a collection of organized data that can be easily accessed, managed, and updated."}}

    output = quiz_generator(generated_data)
    print(output)
    
      