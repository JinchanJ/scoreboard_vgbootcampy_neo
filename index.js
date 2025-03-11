LoadEverything().then(() => {

  let p1Twitter = "";
  let p2Twitter = "";
  let p1Pronoun = "";
  let p2Pronoun = "";
  let newP1Twitter = "";
  let newP2Twitter = "";
  let newP1Pronoun = "";
  let newP2Pronoun = "";
  let savedBestOf = 0;
  let savedMatch = "";
  let firstTime = true;
  let intervalID = "";

  let startingAnimation = gsap
    .timeline({ paused: true })
    .from([".logo"], { duration: 0.5, autoAlpha: 0, ease: "power2.inOut" }, 0.5)
    .from(
      [".anim_container_outer"],
      {
        duration: 1,
        width: "168px",
        ease: "power2.inOut",
      },
      1
    )
    .from(
      [".p1.twitter_container"],
      {
        duration: 0.75,
        x: "-373px",
        ease: "power4.Out",
      },
      "<25%"
    )
    .from(
      [".p2.twitter_container"],
      {
        duration: 0.75,
        x: "373px",
        ease: "power4.Out",
      },
      "<"
    )
    .from(
      ".tournament_container",
      {
        duration: 0.75,
        x: "-373px",
        ease: "power4.Out",
      },
      "<"
    )
    .from(
      ".tournament_logo",
      { opacity: 0, duration: 0.5, ease: "power4.Out" },
      "<"
    );

  Start = async () => {
    startingAnimation.restart();
    intervalID = setInterval(UpdateTwitterMatch, 9000);
    setInterval(TwitterPronounChecker, 100);
    setInterval(matchChecker, 100);
  };

  Update = async (event) => {
    let data = event.data;
    let oldData = event.oldData;

    for (const [t, team] of [
      data.score[window.scoreboardNumber].team["1"],
      data.score[window.scoreboardNumber].team["2"],
    ].entries()) {
      for (const [p, player] of [team.player["1"]].entries()) {
        if (player) {

          if (Object.keys(team.player).length == 1) {
            SetInnerHtml(
              $(`.p${t + 1}.container .name`),
              `
              <span>
                <span class="sponsor">
                  ${player.team ? player.team.replace(/\s*[\|\/\\]\s*/g, ' '): ""}
                </span>
                ${
                  player.name ? await Transcript(player.name) : ""
                }
                ${team.losers ? "(L)" : ""}
              </span>
              `
            );
          } else {
            let teamName = "";

            if (!team.teamName || team.teamName == "") {
              let names = [];
              for (const [p, player] of Object.values(team.player).entries()) {
                if (player && player.name) {
                  names.push(await Transcript(player.name));
                }
              }
              teamName = names.join(" / ");
            } else {
              teamName = team.teamName;
            }

            SetInnerHtml(
              $(`.p${t + 1}.container .name`),
              `
              <span>
                ${teamName}
                ${team.losers ? "(L)" : ""}
              </span>
              `
            );
          }

          SetInnerHtml($(`.p${t + 1} .score`), String(team.score));

          SetInnerHtml(
            $(`.p${t + 1}.container .flagcountry`),
            player.country.asset && Object.keys(team.player).length == 1
              ? `<div class='flag flag_dimension' style='background-image: url(../../${player.country.asset.toLowerCase()})'></div>
              <div class='shiny flag_dimension'></div>`
              : ""
          );

          DisplaySponsorLogo(t, player, team);
          
        }
        if (team.color) {
          document
            .querySelector(":root")
            .style.setProperty(`--p${t + 1}-score-bg-color`, team.color);
        }
        UpdateColor(t);
      }
    }

    // Only on first update
    if (Object.keys(oldData).length == 0) {
      UpdateMatch();
      UpdateTwitter();
      firstTime = false;
    }
  };

  async function DisplaySponsorLogo(t, player, team) {
    await SetInnerHtml(
      $(`.p${t + 1} .sponsor_container`),
      player.sponsor_logo && Object.keys(team.player).length == 1
        ? `<div class='sponsor_logo' style="background-image: url('../../${player.sponsor_logo}')"></div>`
        : ``
    );
    let element = document.querySelector(`.p${t + 1} .sponsor_container`);
    let width = parseFloat(window.getComputedStyle(element).width);
    let styleSheet = document.styleSheets[1];
    if (!width) {
      if (t == 0) {
        styleSheet.insertRule(`.p${t+ 1} .sponsor_logo { margin-left: 0px; !important}`, styleSheet.cssRules.length);
      }
      if (t == 1) {
        styleSheet.insertRule(`.p${t+ 1} .sponsor_logo { margin-right: 0px; !important}`, styleSheet.cssRules.length);
      }
    } else {
      if (t == 0) {
        styleSheet.insertRule(`.p${t+ 1} .sponsor_logo { margin-left: 12px; !important}`, styleSheet.cssRules.length);
      }
      if (t == 1) {
        styleSheet.insertRule(`.p${t+ 1} .sponsor_logo { margin-right: 12px; !important}`, styleSheet.cssRules.length);
      }
    }
  }

  async function UpdateTwitterMatch() {
    UpdateTwitter();
    UpdateMatch();
  }

  async function UpdateMatch() {
    const tournamentContainer = document.querySelector(".tournament_container");

    if (!(data.score[window.scoreboardNumber].best_of
      || data.score[window.scoreboardNumber].match)) {
      tournamentContainer.classList.add("hidden");
      tournamentContainer.classList.remove("unhidden");
    } else {
      tournamentContainer.classList.add("unhidden");
      tournamentContainer.classList.remove("hidden");

      if (!data.score[window.scoreboardNumber].best_of
        && data.score[window.scoreboardNumber].match) {
        SetInnerHtml($(".match"), data.score[window.scoreboardNumber].match.toUpperCase());
      } else if (data.score[window.scoreboardNumber].best_of
        && !data.score[window.scoreboardNumber].match) {
        SetInnerHtml($(".match"), data.score[window.scoreboardNumber].best_of_text.toUpperCase());
      } else if (savedMatch != data.score[window.scoreboardNumber].match) {
        SetInnerHtml($(".match"), data.score[window.scoreboardNumber].match.toUpperCase());
      } else if (savedBestOf != data.score[window.scoreboardNumber].best_of) {
        SetInnerHtml($(".match"), data.score[window.scoreboardNumber].match.toUpperCase());
      } else {
        SetInnerHtml($(".match"), data.score[window.scoreboardNumber].best_of_text.toUpperCase());
        SetInnerHtml($(".match"), data.score[window.scoreboardNumber].match.toUpperCase());
      }
    }
    savedBestOf = data.score[window.scoreboardNumber].best_of;
    savedMatch = data.score[window.scoreboardNumber].match;
  }

  async function UpdateTwitter() {
    changeInP1 = false;
    changeInP2 = false;

    [data.score[window.scoreboardNumber].team["1"], data.score[window.scoreboardNumber].team["2"]].forEach((team, t) => {
      [team.player["1"]].forEach((player, p) => {
        if (player) {
          if (t == 0) {
            newP1Twitter = player.twitter;
            newP1Pronoun = player.pronoun;
          }

          if (t == 1) {
            newP2Twitter = player.twitter;
            newP2Pronoun = player.pronoun;
          }
        }
      });
      if (newP1Twitter != p1Twitter || newP1Pronoun != p1Pronoun) {
        changeInP1 = true;
      }

      if (newP2Twitter != p2Twitter || newP2Pronoun != p2Pronoun) {
        changeInP2 = true;
      }
    });

    [data.score[window.scoreboardNumber].team["1"]
    , data.score[window.scoreboardNumber].team["2"]].forEach((team, t) => {
      [team.player["1"]].forEach((player, p) => {
        if (player) {
          const playerTwitter = document.querySelector(`.p${t + 1}.twitter_container`);

          if (
            !(player.twitter || player.pronoun) ||
            Object.values(team.player).length != 1
          ) {
            playerTwitter.classList.add("hidden");
            playerTwitter.classList.remove("unhidden");
          } else {
            playerTwitter.classList.add("unhidden");
            playerTwitter.classList.remove("hidden");

            if (!player.twitter && player.pronoun) {
              SetInnerHtml(
                $(`.p${t + 1} .twitter`),
                player.pronoun.toUpperCase()
              );
            }

            if (player.twitter && !player.pronoun) {
              SetInnerHtml(
                $(`.p${t + 1} .twitter`),
                player.twitter
                  ? `<span class="twitter_logo"></span>${
                      "@" + String(player.twitter)
                    }`
                  : ""
              );
            }

            if (changeInP1 || changeInP2) {
              if (player.twitter) {
                SetInnerHtml(
                  $(`.p${t + 1} .twitter`),
                  player.twitter
                    ? `<span class="twitter_logo"></span>${
                        "@" + String(player.twitter)
                      }`
                    : ""
                );
              }
            } else {
              if (player.pronoun) {
                SetInnerHtml(
                  $(`.p${t + 1} .twitter`),
                  player.pronoun.toUpperCase()
                );
              }
              if (player.twitter) {
                SetInnerHtml(
                  $(`.p${t + 1} .twitter`),
                  player.twitter
                    ? `<span class="twitter_logo"></span>${
                        "@" + String(player.twitter)
                      }`
                    : ""
                );
              }
            }
          }
          if (t == 0) {
            p1Twitter = player.twitter;
            p1Pronoun = player.pronoun;
          }

          if (t == 1) {
            p2Twitter = player.twitter;
            p2Pronoun = player.pronoun;
          }
        }
      });
    });
  }

  async function TwitterPronounChecker() {
    let refreshNeeded = false;
    [data.score[window.scoreboardNumber].team["1"]
    , data.score[window.scoreboardNumber].team["2"]].forEach((team, t) => {
      [team.player["1"]].forEach((player, p) => {
        if (
          t == 0 &&
          !(p1Twitter == player.twitter && p1Pronoun == player.pronoun)
        ) {
          refreshNeeded = true;
        } else if (
          t == 1 &&
          !(p2Twitter == player.twitter && p2Pronoun == player.pronoun)
        ) {
          refreshNeeded = true;
        }
      });
    });
    if (refreshNeeded && !firstTime) {
      UpdateTwitter();
      resetIntervals();
    }
    refreshNeeded = false;
  }

  function resetIntervals() {
    clearInterval(intervalID);
    intervalID = setInterval(UpdateTwitterMatch, 9000);
  }

  async function matchChecker() {
    let refreshNeeded = false;

    if (
      !(savedBestOf == data.score[window.scoreboardNumber].best_of
        && savedMatch == data.score[window.scoreboardNumber].match)
    ) {
      refreshNeeded = true;
    }

    if (refreshNeeded && !firstTime) {
      UpdateMatch();
      resetIntervals();
    }
    refreshNeeded = false;
  }

  async function UpdateColor(t) {
    let styleSheet = document.styleSheets[1];

    var divs = document.getElementsByClassName(`p${t + 1} container`);

    var div = divs[0];

    var inner_container = div.querySelector(".inner_container");

    var score_container = div.querySelector(".score_container");
    var score_element = score_container.querySelector(".score");

    var name_container = inner_container.querySelector(".name_container");
    var name_element = name_container.querySelector(".name");

    var twitter_element = document.querySelector(`.p${t + 1} .twitter`);

    // Get the background color of the div
    var color = window
      .getComputedStyle(div, null)
      .getPropertyValue("background-color");

    var components = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

    if (components) {
      // Extract the individual RGB components
      var red = parseInt(components[1]);
      var green = parseInt(components[2]);
      var blue = parseInt(components[3]);

      const intensity = red * 0.299 + green * 0.587 + blue * 0.114;

      if (intensity > 142) {

        // Change the text color
        score_element.style.color = "rgb(18, 18, 18, 0.8)";
        twitter_element.style.color = "rgb(18, 18, 18, 0.8)";
        styleSheet.insertRule(`.p${t+ 1} .twitter_logo { background:rgba(18, 18, 18, 0.8) !important}`, styleSheet.cssRules.length);
        name_element.style.color = "white";
        inner_container.style.backgroundColor = "rgba(18, 18, 18, 0.8)";

      } else if (intensity > 95) {

        // Change the text color
        score_element.style.color = "white";
        twitter_element.style.color = "white";
        styleSheet.insertRule(`.p${t+ 1} .twitter_logo { background: white!important}`, styleSheet.cssRules.length);
        name_element.style.color = "white";
        inner_container.style.backgroundColor = "rgba(18, 18, 18, 0.8)";

      } else if (intensity <= 80) {

        // Change the text color
        score_element.style.color = "white";
        twitter_element.style.color = "white";
        styleSheet.insertRule(`.p${t+ 1} .twitter_logo { background: white !important}`, styleSheet.cssRules.length);
        name_element.style.color = "rgb(18, 18, 18, 0.8)";
        inner_container.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
      }
    }
  }
});
