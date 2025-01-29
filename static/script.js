document.addEventListener("DOMContentLoaded", () => {
    //Only establish socket connection if the page is an exercise page

    if (document.getElementById("exercise-reps")) {
        const socket = new WebSocket(`ws://${window.location.host}/ws`);
        
        socket.addEventListener("open", (event) => { 
            console.log("Connected to WebSocket");
        });

        socket.addEventListener("message", (event) => {
            console.log("Message from server ", event.data);
            lines = event.data.split("\n");
            for(line in lines){
                try{
                    // Your existing line processing code
                }catch{
                    console.log("error: ", line)
                }
            }
            document.getElementById("reps").textContent = event.data;
        });

        socket.addEventListener("error", (error) => {
            console.error("WebSocket error:", error);
        });
    }


    // Load stored data or set default values
    let totalTime = parseInt(localStorage.getItem("totalTime")) || 0;
    let repsCompleted = parseInt(localStorage.getItem("repsCompleted")) || 0;
    let workoutsCompleted = parseInt(localStorage.getItem("workoutsCompleted")) || 0;

    if (document.getElementById("calories-burnt")) {
        document.getElementById("calories-burnt").textContent = (totalTime * 0.2).toFixed(1) + " kcal";
        document.getElementById("reps-completed").textContent = repsCompleted;
        document.getElementById("workouts-completed").textContent = workoutsCompleted;
    }

    if (document.getElementById("start-stop-btn")) {
        let exerciseActive = false;
        let reps = 0;
        let startTime;
        let elapsedTime = 0;
        let flexPercent = 0;
        let interval;

        const button = document.getElementById("start-stop-btn");
        const repDisplay = document.getElementById("exercise-reps");
        const timeDisplay = document.getElementById("exercise-time");
        const flexDisplay = document.getElementById("flex-percent");
        const flexRange = document.getElementById("range");

        button.addEventListener("click", () => {
            if (!exerciseActive) {
                // Start Exercise
                startTime = Date.now();
                button.textContent = "Stop";
                button.classList.replace("bg-green-500", "bg-red-500");

                interval = setInterval(() => {
                    elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                    timeDisplay.textContent = elapsedTime + " sec";
                }, 1000);
            } else {
                // Stop Exercise
                clearInterval(interval);
                totalTime += elapsedTime;
                workoutsCompleted++;

                // Save to localStorage
                localStorage.setItem("totalTime", totalTime);
                localStorage.setItem("workoutsCompleted", workoutsCompleted);
                localStorage.setItem("repsCompleted", repsCompleted + reps);

                button.textContent = "Start";
                button.classList.replace("bg-red-500", "bg-green-500");
            }
            exerciseActive = !exerciseActive;
        });

        // Flex Percentage Event Listener
        flexRange.addEventListener("input", (e) => {
            flexPercent = parseInt(e.target.value);
            flexDisplay.textContent = flexPercent + "%";

            // Increase reps when flex is at 90%+
            if (flexPercent >= 90) {
                reps++;
                repDisplay.textContent = reps;
            }
        });
    }
});
