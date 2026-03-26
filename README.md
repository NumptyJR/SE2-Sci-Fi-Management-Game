# Sovereign

Sovereign is a turn-based strategy game where the user must manage resources and select the right choices in order to achieve the highest score possible.

To get the program in a runnable state, first download the zip file and open in an IDE of your choice.

First, navigate to the ScifiFrontend folder and run the command:

    npm install

This ensures you have the correct node modules to run the frontend.

Next, navigate to the backend and install requirements.txt, and activate a virtual environment.

    install -r requirements.txt
    source .venv/bin/activate

Then, while still in the backend, run the server.py file:

    python server.py

This starts up the game's backend. Now, navigate to the frontend, and run the command,

    npm run dev

To run the frontend locally. You can now open the provided localhost link in your browser and begin playing the game.




