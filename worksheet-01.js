document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("worksheetForm");
    const result = document.getElementById("result");

    const gujaratiDigits = "૦૧૨૩૪૫૬૭૮૯";

    function normalize(value) {

        return String(value ?? "")
            .trim()
            .replace(/[૦-૯]/g, d => String(gujaratiDigits.indexOf(d)))
            .replace(/[\s,.-]/g, "")
            .toLowerCase();

    }


    /* =====================================================
       CLOCK
    ===================================================== */

    const clockStates = new Map();


    function drawClock(canvas, hand = null) {

        const ctx = canvas.getContext("2d");

        const w = canvas.width;
        const h = canvas.height;

        const cx = w / 2;
        const cy = h / 2;

        const r = 94;

        ctx.clearRect(0, 0, w, h);


        /* Clock circle */

        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            r,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.lineWidth = 4;
        ctx.strokeStyle = "#172033";

        ctx.stroke();


        /* Numbers */

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "#172033";

        ctx.font = "bold 22px Arial";


        for (let n = 1; n <= 12; n++) {

            const angle =
                n * Math.PI / 6 -
                Math.PI / 2;

            const x =
                cx +
                Math.cos(angle) * 73;

            const y =
                cy +
                Math.sin(angle) * 73;

            ctx.fillText(
                String(n),
                x,
                y
            );

        }


        /* Minute marks */

        ctx.lineWidth = 2;

        for (let i = 0; i < 60; i++) {

            const angle =
                i * Math.PI / 30;

            const outer = r - 5;

            const inner =
                i % 5 === 0
                    ? r - 13
                    : r - 9;

            ctx.beginPath();

            ctx.moveTo(
                cx + Math.cos(angle) * inner,
                cy + Math.sin(angle) * inner
            );

            ctx.lineTo(
                cx + Math.cos(angle) * outer,
                cy + Math.sin(angle) * outer
            );

            ctx.stroke();

        }


        /* Draw student's hands */

        if (hand) {

            const hour = hand.hour;
            const minute = hand.minute;


            const minuteAngle =
                minute * Math.PI / 30 -
                Math.PI / 2;


            const hourAngle =
                (
                    (hour % 12) +
                    minute / 60
                ) *
                Math.PI / 6 -
                Math.PI / 2;


            drawHand(
                ctx,
                cx,
                cy,
                hourAngle,
                55,
                7
            );


            drawHand(
                ctx,
                cx,
                cy,
                minuteAngle,
                75,
                4
            );


            ctx.beginPath();

            ctx.arc(
                cx,
                cy,
                6,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = "#d33";

            ctx.fill();

        }

    }


    function drawHand(
        ctx,
        cx,
        cy,
        angle,
        length,
        width
    ) {

        ctx.beginPath();

        ctx.moveTo(cx, cy);

        ctx.lineTo(
            cx + Math.cos(angle) * length,
            cy + Math.sin(angle) * length
        );

        ctx.lineWidth = width;

        ctx.lineCap = "round";

        ctx.strokeStyle = "#111";

        ctx.stroke();

    }


    /* =====================================================
       INITIALIZE CLOCKS
    ===================================================== */

    document.querySelectorAll(".clock").forEach(canvas => {

        drawClock(canvas);

        clockStates.set(
            canvas,
            {
                hour: null,
                minute: null
            }
        );


        function setTimeFromPointer(e) {

            const rect =
                canvas.getBoundingClientRect();


            const scaleX =
                canvas.width / rect.width;


            const scaleY =
                canvas.height / rect.height;


            const x =
                (e.clientX - rect.left) *
                scaleX;


            const y =
                (e.clientY - rect.top) *
                scaleY;


            const angle =
                Math.atan2(
                    y - canvas.height / 2,
                    x - canvas.width / 2
                ) +
                Math.PI / 2;


            let deg =
                angle * 180 / Math.PI;


            if (deg < 0) {
                deg += 360;
            }


            const minute =
                Math.round(deg / 6) % 60;


            const hour =
                Math.round(minute / 5) % 12 || 12;


            clockStates.set(
                canvas,
                {
                    hour: hour,
                    minute: 0
                }
            );


            drawClock(
                canvas,
                {
                    hour: hour,
                    minute: 0
                }
            );

        }


        canvas.addEventListener(
            "pointerdown",
            e => {

                canvas.setPointerCapture?.(
                    e.pointerId
                );

                setTimeFromPointer(e);

            }
        );

    });


    /* =====================================================
       CLEAR CLOCK
    ===================================================== */

    document.querySelectorAll(".clear-clock")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const canvas =
                        button.parentElement
                            .querySelector(".clock");


                    clockStates.set(
                        canvas,
                        {
                            hour: null,
                            minute: null
                        }
                    );


                    drawClock(canvas);

                }
            );

        });


    function expectedClock(time) {

        const parts =
            time.split(":")
                .map(Number);


        const h = parts[0];
        const m = parts[1];


        return {

            hour:
                h % 12 || 12,

            minute: m

        };

    }


    function clockCorrect(canvas) {

        const wanted =
            expectedClock(
                canvas.dataset.time
            );


        const got =
            clockStates.get(canvas);


        return (
            got &&
            got.hour === wanted.hour &&
            got.minute === wanted.minute
        );

    }


    /* =====================================================
       MCQ ANSWERS
    ===================================================== */

    const mcqAnswers = {

        m1: "B",
        m2: "C",
        m3: "C",
        m4: "A",
        m5: "C",
        m6: "B",
        m7: "A",
        m8: "C",
        m9: "C",
        m10: "B"

    };


    /* =====================================================
       SUBMIT
    ===================================================== */

    form.addEventListener(
        "submit",
        e => {

            e.preventDefault();


            const name =
                document
                    .getElementById("studentName")
                    .value
                    .trim();


            if (!name) {

                alert(
                    "કૃપા કરીને પહેલા વિદ્યાર્થીનું નામ લખો."
                );

                document
                    .getElementById("studentName")
                    .focus();

                return;

            }


            let score = 0;

            let total = 0;


            /* ===============================
               BLANK QUESTIONS
            =============================== */

            const blanks =
                document.querySelectorAll(".blank");


            blanks.forEach(input => {

                total++;

                input.classList.remove(
                    "correct",
                    "wrong"
                );


                if (
                    normalize(input.value) ===
                    normalize(input.dataset.answer)
                ) {

                    score++;

                    input.classList.add(
                        "correct"
                    );

                }

                else {

                    input.classList.add(
                        "wrong"
                    );

                }

            });


            /* ===============================
               TRUE / FALSE
            =============================== */

            const tfs =
                document.querySelectorAll(".tf");


            tfs.forEach(select => {

                total++;

                select.classList.remove(
                    "correct",
                    "wrong"
                );


                if (
                    normalize(select.value) ===
                    normalize(select.dataset.answer)
                ) {

                    score++;

                    select.classList.add(
                        "correct"
                    );

                }

                else {

                    select.classList.add(
                        "wrong"
                    );

                }

            });


            /* ===============================
               MCQ
            =============================== */

            Object.entries(mcqAnswers)
                .forEach(
                    ([nameKey, answer]) => {

                        total++;


                        const chosen =
                            document.querySelector(
                                `input[name="${nameKey}"]:checked`
                            );


                        const radios =
                            document.querySelectorAll(
                                `input[name="${nameKey}"]`
                            );


                        radios.forEach(
                            radio => {

                                radio.parentElement
                                    .classList.remove(
                                        "correct",
                                        "wrong"
                                    );

                            }
                        );


                        if (
                            chosen &&
                            chosen.value === answer
                        ) {

                            score++;

                            chosen.parentElement
                                .classList.add(
                                    "correct"
                                );

                        }

                        else if (chosen) {

                            chosen.parentElement
                                .classList.add(
                                    "wrong"
                                );

                        }

                    }
                );


            /* ===============================
               MATCHING
            =============================== */

            const matches =
                document.querySelectorAll(
                    ".match"
                );


            matches.forEach(select => {

                total++;

                select.classList.remove(
                    "correct",
                    "wrong"
                );


                if (
                    select.value ===
                    select.dataset.answer
                ) {

                    score++;

                    select.classList.add(
                        "correct"
                    );

                }

                else {

                    select.classList.add(
                        "wrong"
                    );

                }

            });


            /* ===============================
               CLOCKS
            =============================== */

            const clocks =
                document.querySelectorAll(
                    ".clock"
                );


            clocks.forEach(canvas => {

                total++;


                const card =
                    canvas.parentElement;


                card.classList.remove(
                    "correct",
                    "wrong"
                );


                if (
                    clockCorrect(canvas)
                ) {

                    score++;

                    card.classList.add(
                        "correct"
                    );

                }

                else {

                    card.classList.add(
                        "wrong"
                    );

                }

            });


            /* ===============================
               RESULT
            =============================== */

            const percent =
                Math.round(
                    (score / total) * 100
                );


            result.className =
                "result " +
                (
                    percent >= 50
                        ? "good"
                        : "warn"
                );


            result.innerHTML = `

                <h2>
                    🎉 ${name}, તમારી Worksheet પૂર્ણ થઈ!
                </h2>

                <p>
                    <strong>
                        મળેલા ગુણ: ${score} / ${total}
                    </strong>
                </p>

                <p>
                    ટકા:
                    <strong>
                        ${percent}%
                    </strong>
                </p>

                <p>
                    ${
                        percent >= 50
                        ? "👏 ખૂબ સરસ! આગળ પણ આવી જ મહેનત કરો."
                        : "💪 વધુ મહેનત કરો. તમે ચોક્કસ સુધારો કરી શકશો."
                    }
                </p>

            `;


            result.classList.remove(
                "hidden"
            );


            result.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }
    );

});
