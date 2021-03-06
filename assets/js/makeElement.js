makeElement = {
    buildSentMessage: function(player, message, time) {

        var messageContainer = $('<div>').addClass('row msg_container base_sent');

        var messageHolder = $('<div>').addClass('col-md-10 col-xs-10');
        messageContainer.append(messageHolder);
        var messageBox = $('<div>').addClass('messages msg_sent');
        messageHolder.append(messageBox);
        var message = $('<p>').html(sentMessageText);
        messageBox.append(message);

        var avatarContainer = $('<div>').addClass('col-md-2 col-xs-2 avatar');
        messageContainer.append(avatarContainer);
        var avatarImage = $('<img>')
        avatarImage.attr('class', 'img-responsive')
        avatarImage.attr('src', 'http://www.bitrebels.com/wp-content/uploads/2011/02/Original-Facebook-Geek-Profile-Avatar-1.jpg');
        avatarContainer.append(avatarImage);

        $('#chat').append(messageContainer);
    },
    buildReceivedMessage: function(player, message, time) {

        var messageContainer = $('<div>').addClass('row msg_container base_receive');

        var avatarContainer = $('<div>').addClass('col-md-2 col-xs-2 avatar');
        messageContainer.append(avatarContainer);
        var avatarImage = $('<img>')
        avatarImage.attr('class', 'img-responsive')
        avatarImage.attr('src', 'http://www.bitrebels.com/wp-content/uploads/2011/02/Original-Facebook-Geek-Profile-Avatar-1.jpg');
        avatarContainer.append(avatarImage);

        var messageHolder = $('<div>').addClass('col-md-10 col-xs-10');
        messageContainer.append(messageHolder);
        var messageBox = $('<div>').addClass('messages msg_receive');
        messageHolder.append(messageBox);
        var message = $('<p>').html(receivedMessageText);
        messageBox.append(message);

        $('#chat').append(messageContainer);
    },

    newWhiteCard: function(card, whiteCard, cardNum) {
        if (card === "black") {
            whiteCard = whiteCard.replace(/_/g, "____")
        }
        let newBtn = $("<button>").text("Choose Card").addClass("shBtn");
        $("#" + card).attr("cardNum", cardNum)
        $('#' + card + ' .flipper .back p span').html(whiteCard);
        // $('#' + card + ' .flipper .back p').append(newBtn)
        // console.log("btn added", card)
        if ($("#" + card).hasClass("flip")) {
            $("#" + card).removeClass("flip");
            setTimeout(function() {
                $("#" + card).addClass("flip");
            }, 600)


        } else {
            $("#" + card).addClass("flip");
        }
    },

    mainClick: function(pick, host, currentTurn) {
        $(".flip-container").hover(function() {

            $(this).children(".flipper").children(".back").children(".shBtn").show()
        }, function() {
            $(this).children(".flipper").children(".back").children(".shBtn").hide()
        })

        if (pick === 1) {

            $(".flip-container").on("click", function() {
                    let cardId = $(this).attr("id");
                    cardNum = $(this).attr("cardNum");
                    currentPlayerRef.child((host ? "host" : currentUid)).update({
                            chosenWhiteCard1: cardNum
                        }).then(function() {
                            currentChatRef.push({
                                displayName: "System",
                                message: currentDisplayName + " has Picked.",
                                timeStamp: firebase.database.ServerValue.TIMESTAMP
                            })
                            fireObj.dealOneCard(localWhiteOrder, host, cardId);
                            $(".flip-container").off();
                            let allPicked = true;
                            currentPlayerRef.once("value", function(snap) {
                                snap.forEach(function(snap) {
                                    if (snap.key != currentTurn && allPicked) {
                                        if (snap.val().chosenWhiteCard1 === "") {
                                            allPicked = false;
                                        } //if2
                                    } //if1
                                })
                                if (allPicked) {
                                    currentGameRef.update({
                                        state: state.pickWhite
                                    })
                                } //if
                                //then
                            })
                        }) //then
                }) //click

        } else {

            let secondPick = false;
            let firstCard = "";
            let firstCardId = "";
            $(".flip-container").on("click", function() {
                let cardId = $(this).attr("id");
                cardNum = $(this).attr("cardNum");
                if (secondPick) {
                    if (cardNum === firstCard) {
                        $(this).removeClass("glow")
                            //if card already selected deselect it
                        firstCard = ""
                        secondPick = false;
                    } else {
                        currentPlayerRef.child((host ? "host" : currentUid)).update({
                                chosenWhiteCard2: cardNum,
                                chosenWhiteCard1: firstCard
                            }).then(function() {
                                currentChatRef.push({
                                    displayName: "System",
                                    message: currentDisplayName + " has Picked.",
                                    timeStamp: firebase.database.ServerValue.TIMESTAMP
                                })
                                fireObj.dealOneCard(localWhiteOrder, host, cardId);
                                fireObj.dealOneCard(localWhiteOrder, host, firstCardId)
                                $("#" + firstCardId).removeClass("glow")
                                $(".flip-container").off();
                                let allPicked = true;
                                currentPlayerRef.once("value", function(snap) {
                                        snap.forEach(function(snap) {
                                            if (snap.key != currentTurn && allPicked) {

                                                if (snap.val().chosenWhiteCard1 === "" || snap.val().chosenWhiteCard2 === "") {
                                                    allPicked = false;
                                                } //if2
                                            } //if1
                                        })
                                        if (allPicked) {
                                            currentGameRef.update({
                                                state: state.pickWhite
                                            }).then(function() {

                                            })
                                        } //if

                                    }) //then
                            }) //then
                    }
                } else {
                    $(this).addClass("glow")

                    firstCard = cardNum;
                    secondPick = true;
                    firstCardId = cardId;

                }
            })
        }

    },
    buildOpenGame: function(key, host, winLimit, playerLimit) {
        //TODO: move with other html builders
        let newTr = $("<tr>").attr("id", key + "Open");
        let hostTh = $("<td>").text(host);
        let players = $("<td>").addClass('text-center');
        let winCount = $("<td>").addClass('text-center');
        let joinBtn = $("<button>").attr("id", key).text("Join").addClass("col-md-12 btn btn-warning");
        let btnTd = $("<td>").append(joinBtn);
        players.html("<span id ='" + key + "Players'>1</span>/" + playerLimit);
        winCount.text(winLimit);
        newTr.append(hostTh);
        newTr.append(players);
        newTr.append(winCount);
        newTr.append(btnTd);
        $("#current-game-table").append(newTr);
        gameRef.child(key).child("totalPlayers").on("value", function(snap) {
            $("#" + key + "Players").text(snap.val());
        })
        $("#" + key).on("click", function() {
            gameRef.child(key).once("value", function(snap) {
                let max = snap.val().playerLimit
                gameRef.child(key).child("totalPlayers").transaction(function(snap) {
                    if (snap < max) {
                        fireObj.gameState(key)
                        return snap
                    }
                })
            })
        })

    },
    buildPlayerList: function(playerKey, uid, displayName) {
        let isSet = false;
        for (var i = 0; i < 4; i++) {
            if ($("#row" + i).children().length < 2 && !isSet) {
                let newTd = $("<td>").text(displayName + " - ").attr("data-id", uid).addClass("openProfile");
                let badgeSpan = $('<span>').addClass('badge');
                let newSpan = $("<span>").attr("id", uid + "blackCount").text("0");
                let newGlyph = $("<span>").addClass("glyphicon glyphicon-stop");
                badgeSpan.append(newSpan).append(newGlyph);
                newTd.append(badgeSpan);
                $("#row" + i).append(newTd);
                isSet = true;
                playerRef.child(playerKey + "/" + uid).child("playerBlackCount").on("value", function(snap) {
                    $("#" + uid + "blackCount").text(snap.val())
                })
                if (uid === "host") {
                    currentPlayerRef.child("host").child("uid").once("value", function(snap) {
                        newTd.attr("data-id", snap.val())
                    })
                }
            }

        }
    },
    blackCardClick: function(name) {
        $("#" + name).on("click", function() {
            let displayName = $(this).attr("id");
            currentPlayerRef.once("value", function(snap) {
                snap.forEach(function(childSnap) {
                    let uid = childSnap.key
                    if (displayName === childSnap.val().displayName) {
                        currentGameRef.update({
                            winner: uid,
                            state: state.showCards
                        })
                        $("#selectedBlack div .flip-container").off();
                    }
                })
            })

        })
    }


}
let profile = {

    profileUpdate: function(name, imgSrc) {
        $('#profile-name').text(name);
        $('#frame').attr('src', imgSrc);
    },

    blackCardTotal: function(totalBlackCount) {
        $('#totalBlackCount').html('');
        let tableRow = $('<tr>');
        let tableContent = $('<td>').text(totalBlackCount);
        tableRow.append(tableContent);
        $('#totalBlackCount').append(tableRow);
    },

    mostWonBlack: function(mostWonText, numberWonCount) {
        let tableRow = $('<tr>');
        let tableText = $('<td>').text(mostWonText);
        let tableNumber = $('<td>').text(numberWonCount);
        tableRow.append(tableText);
        tableRow.append(tableNumber);
        $('#mostWonBlack').append(tableRow);
    },

    buildProfile: function(userId) {
        userRef.child(userId).once('value', function(snap) {
            profile.profileUpdate(snap.val().displayName, snap.val().profile.pic);
            profile.blackCardTotal(snap.val().totalBlackCount);
        })
        userRef.child(userId).child("blackCards").once("value", function(snap) {
            let first = 0;
            let second = 0;
            let third = 0
            let firstNum = 0;
            let firstNum2 = 0
            let secondNum = 0;
            let secondNum2 = 0
            let thirdNum = 0;
            let thirdNum2 = 0
            snap.forEach(function(firstSnap) {
                    firstSnap.forEach(function(secondSnap) {
                            if (secondSnap.val() > first) {
                                first = secondSnap.val()
                                firstNum2 = secondSnap.key
                                firstNum = firstSnap.key
                            } else if (secondSnap.val() > second) {
                                second = secondSnap.val()
                                secondNum2 = secondSnap.key
                                secondNum = firstSnap.key
                            } else if (secondSnap.val() > third) {
                                third = secondSnap.val()
                                thirdNum2 = secondSnap.key
                                thirdNum = firstSnap.key
                            }
                        }) //forEach2
                }) //forEach1
            blackCardRef.child(firstNum).child(firstNum2).child("text").once("value", function(snap) {
                    profile.mostWonBlack(snap.val(), first)
                }).then(function() {
                    blackCardRef.child(secondNum).child(secondNum2).child("text").once("value", function(snap) {
                        profile.mostWonBlack(snap.val(), second)
                    }).then(function() {
                        blackCardRef.child(thirdNum).child(thirdNum2).child("text").once("value", function(snap) {
                            profile.mostWonBlack(snap.val(), third)
                        })
                    })
                }) //once
        })
    }

}
