// UsersAnswers is a dynamic object that stores the answers to the quiz questions. 
// Update it as soon as possible (like in the onchange event)
// and the end of the quiz, this is what is sent to our API to calculate the streamer. 
var UsersAnswers = {};

// CurrentQuestion represents which question we are on
var CurrentQuestion = 1;

// holds the references to the sliders so we can call 
// functions on it
var SLIDERS = {};

// a timer for if the increment/decrement buttons are long-held,
// since we want to continue to increment/decrement when button is held
var pressTimer;

// statistic of scoring result
var ResultStats = {};


// This is called when the page is loaded
$(() => {
  // First thing we do is generate all the HTML we need for the quiz
  BuildQuiz(); // This is defined in 'create_quiz.js'

  // setup our bootstrap elements like the sliders
  setupElements();

  // setup the callbacks for the different events
  setupCallbacks();

  //starts page animations
  animateElements();
});

function setupElements() {
  InitializeSliders();
  InitializeTimePickers();
  UnselectAllSwitches();
  HideElementsAtQuizStart();
  // statistic tooltip hovefr
  setupStatsTooltipHover();
}

function InitializeSliders() {
  QUIZ_QUESTIONS.forEach(question => {
    if (question.question_type == QuestionTypes.RangeSlider) {
      setSliderDisplay(question.unique_question_identifier, question.answer_settings);
      setSliderEventHandlers(question.unique_question_identifier, question.answer_settings);
    }
  })
}

function InitializeTimePickers() {
  $('.time').clockTimePicker({
    onClose: function () {
      captureTimeInputs();
    },
    alwaysSelectHoursFirst: true,
    required: true,
    // custom colors
    colors: {
      buttonTextColor: '#bf7dd3',
      clockFaceColor: '#EEEEEE',
      clockInnerCircleTextColor: '#888888',
      clockInnerCircleUnselectableTextColor: '#CCCCCC',
      clockOuterCircleTextColor: '#000000',
      clockOuterCircleUnselectableTextColor: '#CCCCCC',
      hoverCircleColor: '#DDDDDD',
      popupBackgroundColor: '#FFFFFF',
      popupHeaderBackgroundColor: '#0797FF',
      popupHeaderTextColor: '#FFFFFF',
      selectorColor: '#DAB9DF',
      selectorNumberColor: '#FFFFFF',
      signButtonColor: '#FFFFFF',
      signButtonBackgroundColor: '#0797FF'
    },
  });
}

function UnselectAllSwitches() {
  $(`[id^="generated-switch_"]`).prop('checked', "");
}

function HideElementsAtQuizStart() {
  // Hides all the questions to start (except for the 1st)
  for (i = CurrentQuestion + 1; i <= QUIZ_QUESTIONS.length; i++) {
    $(`#generated-quiz-modal-question${i}-container`).hide()
  }

  $(`#generated-question-result-container`).hide()
  $(`#generated-streamer-reveal-container`).hide()
  QUIZ_QUESTIONS.forEach(question => {
    if (question.question_type == QuestionTypes.TimeRange) {
      question.answer_settings.forEach(timeInput => {
        $(`#generated-${question.unique_question_identifier}-${timeInput.value_name}`).hide()
      })
    }
  })

  $(`#restart-button`).hide();
  // disable the continue button by default
  $(`#continue-button`).prop('disabled', true);
}

function setSliderDisplay(sliderName, settings) {
  let minRange = settings.min;
  let maxRange = settings.max;
  let minDefault = Math.floor(maxRange / 4);
  let maxDefault = Math.floor(maxRange / 4) * 3;
  let displayText = `Between ${minDefault} and ${maxDefault} ${settings.suffix}`;
  $(`#generated-${sliderName}-slider-display`).text(displayText);
  SLIDERS[sliderName] = $(`#generated-slider_${sliderName}`).slider({ id: `generated-slider_${sliderName}`, min: minRange, max: maxRange, range: true, value: [minDefault, maxDefault], tooltip: 'hide' });
  UsersAnswers[sliderName] = {
    min: minDefault,
    max: maxDefault
  };
}

function openGeneratedQuizModal() {
  $("#generated-quiz-modal").modal('show');
}

function setSliderEventHandlers(sliderName, settings) {
  // how many milliseconds to hold down the button before it starts incrementing
  const incrementDelay = 100;

  // we want to increment the value when holding the mouse button down,
  // and if we click, only increment by 1 unit
  $(`#generated-${sliderName}-minus`).mouseup(function () {
    // Clear timeout
    clearInterval(pressTimer);
    return false;
  }).mousedown(function () {
    if (UsersAnswers[sliderName].min > settings.min) {
      SLIDERS[sliderName].slider('setValue', [(UsersAnswers[sliderName].min - settings.incrementBy), UsersAnswers[sliderName].max], true); // must be true to call the 'slide' event
    }
    // Set interval
    pressTimer = window.setInterval(function () {
      if (UsersAnswers[sliderName].min > settings.min) {
        SLIDERS[sliderName].slider('setValue', [(UsersAnswers[sliderName].min - settings.incrementBy), UsersAnswers[sliderName].max], true); // must be true to call the 'slide' event
      }
    }, incrementDelay);
    return false;
  });
  $(`#generated-${sliderName}-plus`).mouseup(function () {
    clearInterval(pressTimer);
    return false;
  }).mousedown(function () {
    if (UsersAnswers[sliderName].max < settings.max) {
      SLIDERS[sliderName].slider('setValue', [UsersAnswers[sliderName].min, (UsersAnswers[sliderName].max + settings.incrementBy)], true); // must be true to call the 'slide' event
    }
    // Set interval
    pressTimer = window.setInterval(function () {
      if (UsersAnswers[sliderName].max < settings.max) {
        SLIDERS[sliderName].slider('setValue', [UsersAnswers[sliderName].min, (UsersAnswers[sliderName].max + settings.incrementBy)], true); // must be true to call the 'slide' event
      }
    }, 100);
    return false;
  });
}

function setupCallbacks() {
  // When the range is adjusted, display the changes in text, 
  // and save the value to the UserAnswers array. 
  // Setup the sliders, assuming 1 slider with 2 values per question
  QUIZ_QUESTIONS.forEach(question => {
    if (question.question_type == QuestionTypes.RangeSlider) {
      $(`#generated-slider_${question.unique_question_identifier}`).on("slide", (changeEvt) => adjustSliderEventHandler(question.unique_question_identifier, question.answer_settings, changeEvt))
    }
  })
}


const adjustSliderEventHandler = (sliderName, settings, changeEvt) => {
  let minRange = changeEvt.value[0];
  let maxRange = changeEvt.value[1];
  let maxRangeDisplay = ((sliderName == "average_viewers" && maxRange == 10000) ? `10000+` : maxRange);
  let displayText = `Between ${minRange} and ${maxRangeDisplay} ${settings.suffix}`;
  $(`#generated-${sliderName}-slider-display`).text(displayText);
  UsersAnswers[sliderName] = {
    min: minRange,
    max: maxRange
  }
}

function toggleTimeInput(question, selection) {
  let selectedSwitch = `#generated-switch_${question}_${selection}`;
  if ($(selectedSwitch).prop("checked") == true) {
    $(`#generated-${question}-${selection}`).show();
  } else {
    $(`#generated-${question}-${selection}`).hide();
  }
}

function selectMultipleButton(question, selection) {
  if (UsersAnswers[question]) {
    if (UsersAnswers[question].includes(selection)) {
      // remove it from the list
      var index = UsersAnswers[question].indexOf(selection);
      if (index > -1) {
        UsersAnswers[question].splice(index, 1);
        $(`#generated-quiz-modal-button_${question}_${selection}`).removeClass('active');
      }
    } else {
      UsersAnswers[question].push(selection)
      $(`#generated-quiz-modal-button_${question}_${selection}`).addClass('active');
    }
  } else {
    UsersAnswers[question] = [];
    UsersAnswers[question].push(selection)
    $(`#generated-quiz-modal-button_${question}_${selection}`).addClass('active');
  }

  //if no answer, block the continue button
  if (UsersAnswers[question].length == 0) {
    $(`#continue-button`).prop('disabled', true)
  } else {
    $(`#continue-button`).prop('disabled', false)
  }
  console.log(UsersAnswers)
}

function nextQuestion() {
  console.log(UsersAnswers)
  // adjusts the display progress bar
  adjustProgressBar(CurrentQuestion);

  // see if we are on the last question
  if (CurrentQuestion == QUIZ_QUESTIONS.length) {
    $('#generated-quiz-modal-progress-label').text(`Results`);
    $(`#generated-quiz-modal-question${CurrentQuestion}-container`).addClass("fade-out");
    $("#continue-button").hide();
    setTimeout(() => {
      $(`#generated-quiz-modal-question${CurrentQuestion}-container`).hide()
      $(`#generated-question-result-container`).addClass("fade-in")
      $(`#generated-question-result-container`).show()
      calculateQuizResult();
    }, 250);
  } else {
    // go to next question
    // slide out current question
    $(`#generated-quiz-modal-question${CurrentQuestion}-container`).addClass("fade-out")
    // wait 250 ms before sliding in next question
    setTimeout(() => {
      $(`#generated-quiz-modal-question${CurrentQuestion}-container`).hide()
      // disable the continue button by default for this question
      $(`#continue-button`).prop('disabled', true)
      // and unfocus it
      $(`#continue-button`).blur()
      // enable or disable the continue button by default for the next question
      $(`#continue-button`).prop('disabled', QUIZ_QUESTIONS[CurrentQuestion].disableContinueButtonByDefault)
      // increment the question
      CurrentQuestion += 1;
      // change the title
      $('#generated-quiz-modal-progress-label').text(`Question ${CurrentQuestion} of ${QUIZ_QUESTIONS.length}`);
      // slide in the next
      $(`#generated-quiz-modal-question${CurrentQuestion}-container`).addClass("fade-in")
      $(`#generated-quiz-modal-question${CurrentQuestion}-container`).show()
    }, 250);
  }
}

function restartQuiz() {
  // reset the global variables
  CurrentQuestion = 1;
  UsersAnswers = {};
  // get rid of unwanted effects
  $(`*`).removeClass(`fade-out`);
  $(`button.active`).removeClass(`active`);
  //initialization again
  BuildQuiz();
  setupElements();
  setupCallbacks();
  // change the title
  $('#generated-quiz-modal-progress-label').text(`Question 1 of ${QUIZ_QUESTIONS.length}`);
  // show the first quiz container
  $(`#generated-question1-container`).addClass("fade-in")
  $(`#generated-question1-container`).show();
  // show the continue button
  $(`#continue-button`).show();
  // adjust progress bar to first question
  adjustProgressBar(0);
}

function adjustProgressBar(index) {
  let questionNum = index + 1;
  $("#generated-quiz-modal-progress-bar").css("width", `${((questionNum) / QUIZ_QUESTIONS.length * 100)}%`);
}

function closeQuizModal() {
  $("#quiz-modal").modal('hide');
}

function animateElements() {
  $("#bg-rectangle").addClass("bounce-in-top");
  $("#bg-rectangle").show();
  $("#dancing-jinri").addClass("slide-in-right");
  $("#dancing-jinri").show();
  $("#logo-container").addClass("slide-in-blurred-left")
  $("#start-quiz-button").addClass("fade-in");
  $("#start-quiz-button-modal").addClass("fade-in");
  $("#welcome-text").addClass("swing-in-left-fwd")
}

function calculateQuizResult() {
  // Send the results to the server
  $.ajax({
    beforeSend: console.log(`sending answers...`),
    url: "/calculateStreamer",
    type: "POST",
    data: { UsersAnswers },
    success: function (data) {
      console.log(data)
      setTimeout(() => {
        $(`#generated-question-result-container`).addClass("fade-out")
        setTimeout(() => {
          $(`#generated-question-result-container`).hide()
          if (data.Error != null) {
            console.log(data.Error.message)
            $(`#generated-streamer-reveal-container`).show()
          } else {
            console.log(data.Results);
            displayStreamerResults(data.Results);
            $(`#generated-streamer-reveal-container`).addClass("fade-in");
            $(`#generated-streamer-reveal-container`).show();
            $("#restart-button").show();
            console.log("complete.")
          }
        }, 350);
      }, 2500)
    },
    complete: function (xhr, status) {
      if (status == 'error') {
        console.log('error')
      }
    }
  });
}

function displayStreamerResults(results) {
  var streamers = results.result;
  ResultStats = results.stats;
  streamers.forEach((streamer, index) => {
    $(`#streamer-${index + 1}-user_name`).text(streamer.user_name);
    $(`#streamer-${index + 1}-logo`).attr('src', streamer.logo);
    $(`#streamer-${index + 1}-match`).text(streamer.match_value);
    $(`#streamer-${index + 1}-twitch_link`).attr("href", `https://twitch.tv/${streamer.user_name}`);
    $($(".streamer-info-container").get(index)).attr("streamer_id", streamer.id);
  });
}

function captureTimeInputs() {
  var offset = new Date().getTimezoneOffset();
  QUIZ_QUESTIONS.forEach(question => {
    if (question.question_type == QuestionTypes.TimeRange) {
      let timeObj = {}
      question.answer_settings.forEach(timeRange => {
        timeObj[timeRange.value_name] = ($(`#generated-switch_${question.unique_question_identifier}_${timeRange.value_name}`).prop("checked") == true);
        timeObj[`${timeRange.value_name}From`] = $(`#generated-${question.unique_question_identifier}-${timeRange.value_name}-from`).val();
        timeObj[`${timeRange.value_name}To`] = $(`#generated-${question.unique_question_identifier}-${timeRange.value_name}-to`).val();
      })
      timeObj.userOffsetMinute = offset * -1;
      UsersAnswers[question.unique_question_identifier] = timeObj;
    }
  })

}

function setupStatsTooltipHover() {
  $(".streamer-info-container").tooltip({
    placement: "right",
    sanitize: false,
    html: true,
    title: function () {
      var el = $(this);
      var id = el.attr("streamer_id");
      if (!(id in ResultStats)) {
        return ""
      }

      var tooltip = "<table style='text-align: left'>";
      for (var k in ResultStats[id]) {
        var v = ResultStats[id][k];
        var kColor = statsTooltipColor(v);
        tooltip += "<tr>";
        tooltip += "<td>" + k + "</td>";
        tooltip += "<td>:</td>";
        tooltip += "<td style='color:" + kColor + "'>" + v + "%</td>";
        tooltip += "</tr>";
      }
      tooltip += "</table>";
      return tooltip
    },
  })
}

function statsTooltipColor(v) {
  if (v >= 70) {
    return "#1df51d"
  } else if (v < 30) {
    return "#f52525"
  }
  return "white"
}
