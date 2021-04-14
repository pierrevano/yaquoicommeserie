var DOMLoaded = function() {
    var Shuffle = window.Shuffle;
    var shuffleInstance;

    var genreArray = Array.from(document.querySelectorAll('.filter-options button'));
    var periodArray = Array.from(document.querySelectorAll('.period-options option'));
    var criticArray = Array.from(document.querySelectorAll('.nav-item.criticButton:not(.mainToggle)'));
    var networkArray = Array.from(document.querySelectorAll('.nav-item.networkButton:not(.mainToggleNetwork)'));
    var nationalityArray = Array.from(document.querySelectorAll('.nav-item.nationalityButton:not(.mainToggleNationality)'));
    var durationArray = Array.from(document.querySelectorAll('.nav-item.durationButton:not(.mainToggleDuration)'));
    var starsArray = Array.from(document.querySelectorAll('.nav-item.starsButton:not(.mainToggleStars)'));

    var gridContainerElement = document.querySelector('#grid');

    var criticInput = document.querySelector('.nav-item.criticAllocine');
    var networkInput = document.querySelector('.nav-item.mainToggleNetwork');
    var nationalityInput = document.querySelector('.nav-item.mainToggleNationality');
    var durationInput = document.querySelector('.nav-item.mainToggleDuration');
    var starsInput = document.querySelector('.nav-item.mainToggleStars');

    var criticToggle0 = document.querySelector('#criticToggle0').parentNode.parentNode;
    var networkButton0 = document.querySelector('#networkButton0').parentNode.parentNode;
    var nationalityButton0 = document.querySelector('#nationalityButton0').parentNode.parentNode;
    var durationButton0 = document.querySelector('#durationButton0').parentNode.parentNode;
    var starsButton0 = document.querySelector('#starsButton0').parentNode.parentNode;

    var userRatingLi = document.querySelector('.nav-item.userRating');
    var imdbUserRatingLi = document.querySelector('.nav-item.imdbUserRating');
    var betaseriesUserRatingLi = document.querySelector('.nav-item.betaseriesUserRating');
    var periodOption = document.querySelector('.period-options');
    var criticLi = document.querySelector('.criticRatings');
    var networkLi = document.querySelector('.networkPreferences');
    var nationalityLi = document.querySelector('.nationalityPreferences');
    var durationLi = document.querySelector('.durationPreferences');
    var starsLi = document.querySelector('.starsPreferences');

    var tglDarkmode = document.querySelector('.tgl-darkmode');

    var criticNull = false;

    var criticNumberBool = false;
    var networkNumberBool = false;
    var nationalityNumberBool = false;
    var durationNumberBool = false;
    var starsNumberBool = false;

    var localbuttonCriticNameNumber = 0;
    var localbuttonNetworkNameNumber = 0;
    var localbuttonNationalityNameNumber = 0;
    var localbuttonDurationNameNumber = 0;
    var localbuttonStarsNameNumber = 0;

    const options = {
        time: '0.5s',
        mixColor: '#FFFFFF',
        backgroundColor: '#EDEDED'
    };

    const darkmode = new Darkmode(options);

    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);

    localStorage.setItem('yqcs_menu.' + 'menuBool', false);

    fetch('https://yaquoicommeserie.fr/assets/js/data.json')
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            var data = response.data;

            menuCriticsOnLoad();

            var markup = getItemMarkup(data);
            appendMarkupToGrid(markup);

            shuffleInstance = new Shuffle(gridContainerElement, {
                itemSelector: '.picture-item',
                sizer: '.my-sizer-element'
            });

            filters = {
                periodArray: [],
                genreArray: [],
                networkArray: ['No network'],
                nationalityArray: ['No nationality'],
                durationArray: ['No duration'],
                starsArray: ['No stars']
            };

            var mode = localStorage.getItem('yqcs_mode.' + 'mode');
            var filterLabel = document.querySelector('.filter-label');

            if (mode === 'additive') {
                filterLabel.innerHTML = 'Genre (cumuler <input id="inputToggle" type="checkbox" checked><label for="inputToggle">)</label>';
            } else {
                filterLabel.innerHTML = 'Genre (cumuler <input id="inputToggle" type="checkbox"><label for="inputToggle">)</label>';
            }

            removeItems();
            addSearchFilter();
            addSorting();
            addPeriodFilter();
            bindPeriodAndGenreListeners();
            clickToggleMode();
            darkmodePref();
            defaultInputClick();
            displayOverlay();
            focusSearchInput();
            getDarkmodeStatus();
            getTglButtons();
            menuButtonsChecked();
            menuNetworkOnLoad();
            menuNationalityOnLoad();
            menuDurationOnLoad();
            menuStarsOnLoad();
            ratingInfoDetails();
            reset();
            searchShortcut();
            setMenuButtonAll();
            typewriter();
        });

    // Set or unset active critic on load
    function menuCriticsOnLoad() {
        criticArray.forEach(function(button) {
            button.children[0].children[0].addEventListener('click', setLocalStorageCritics.bind(this), false);

            var buttonCriticName = button.children[0].children[0].textContent;
            var localbuttonCriticName = localStorage.getItem('yqcs_critic.' + buttonCriticName);

            if (localbuttonCriticName == 'true' || localbuttonCriticName == null) {
                criticNumberBool = true;
                localbuttonCriticNameNumber++;
                if (localbuttonCriticName == null) {
                    localStorage.setItem('yqcs_critic.' + buttonCriticName, 'true');
                }
            } else if (localbuttonCriticName == 'false') {
                button.children[0].children[0].children[0].children[0].removeAttribute('checked');
            }
        });

        if (localbuttonCriticNameNumber > 0) {
            criticLi.children[1].children[0].innerHTML = '<i class="fas fa-newspaper fa-lg"></i> Presse AlloCiné<span class="criticNumber">' + localbuttonCriticNameNumber + '</span>';
        } else {
            criticLi.children[1].children[0].innerHTML = '<i class="fas fa-newspaper fa-lg"></i> Presse AlloCiné<span class="criticNumber criticNumberZero">0</span>';
        }

        if (criticNumberBool) {
            localStorage.setItem('yqcs_critic.' + 'criticAllocine', 'true');
            criticInput.children[0].children[0].innerHTML = 'Tout désélectionner<span><input id="criticToggle0" type="checkbox" checked="checked"><label for="criticToggle0"></label></span>';
        } else {
            localStorage.setItem('yqcs_critic.' + 'criticAllocine', 'false');
            criticInput.children[0].children[0].innerHTML = 'Tout sélectionner<span><input id="criticToggle0" type="checkbox"><label for="criticToggle0"></label></span>';
        }
    }

    // Set yqcs_localStorage for each critics button
    function setLocalStorageCritics(item) {
        localStorage.setItem('yqcs_menu.' + 'menuBool', true);

        var buttonCriticName = item.currentTarget.innerText;
        var localbuttonCriticName = localStorage.getItem('yqcs_critic.' + buttonCriticName);

        if (localbuttonCriticName == 'true') {
            item.currentTarget.children[0].children[0].removeAttribute('checked');
            localStorage.setItem('yqcs_critic.' + buttonCriticName, 'false');
            localbuttonCriticNameNumber--;
        } else {
            item.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
            localStorage.setItem('yqcs_critic.' + buttonCriticName, 'true');
            localbuttonCriticNameNumber++;
        }

        if (localbuttonCriticNameNumber > 0) {
            criticLi.children[1].children[0].innerHTML = '<i class="fas fa-newspaper fa-lg"></i> Presse AlloCiné<span class="criticNumber">' + localbuttonCriticNameNumber + '</span>';
        } else {
            criticLi.children[1].children[0].innerHTML = '<i class="fas fa-newspaper fa-lg"></i> Presse AlloCiné<span class="criticNumber criticNumberZero">0</span>';
        }
    }

    // Retrieve all items from data object
    function getItemMarkup(items) {
        return items.reduce(function(str, item) {
            return str + getMarkupFromData(item);
        }, '');
    }

    // Get selected data from data object
    function getMarkupFromData(dataForSingleItem) {
        var serieId = dataForSingleItem.id,
            url = dataForSingleItem.allocineData.url,
            titleTemp = dataForSingleItem.allocineData.title,
            creationDate = dataForSingleItem.allocineData.creationDate,
            duration = dataForSingleItem.imdbData.duration,
            picture = dataForSingleItem.allocineData.picture,
            status = dataForSingleItem.betaseriesData.betaseriesStatus,
            serieTrailerId = dataForSingleItem.allocineData.serieTrailerId,
            criticNames = dataForSingleItem.allocineData.criticNames,
            criticFix = dataForSingleItem.allocineData.critic,
            user = dataForSingleItem.allocineData.user,
            seasonsCritic = dataForSingleItem.allocineData.seasonsCritic,
            betaseriesRatingTemp = dataForSingleItem.betaseriesData.betaseriesRating,
            betaseriesId = dataForSingleItem.betaseriesData.betaseriesId,
            date = dataForSingleItem.imdbData.date,
            imdbId = dataForSingleItem.imdbData.imdbId,
            imdbRating = dataForSingleItem.imdbData.imdbRating,
            divisionNumber = 0,
            genre, title, rating;

        var seasonsCriticValue = '';
        var seasonsCriticDetails = '';
        if (seasonsCritic !== undefined) {
            seasonsCriticValue = dataForSingleItem.allocineData.seasonsCritic.seasonsCriticValue;
            seasonsCriticDetails = dataForSingleItem.allocineData.seasonsCritic.seasonsCriticDetails;
        }
        var seasonsCriticDetailsArray = getseasonsCritic(seasonsCriticDetails);
        var seasonsCriticArray = getseasonsCritic(seasonsCriticValue);

        var urlId = dataForSingleItem.allocineData.url.match(/=(.*)\./).pop();

        if (dataForSingleItem.allocineData.genre !== undefined) {
            if (dataForSingleItem.allocineData.genre.id3 !== undefined) {
                genre = dataForSingleItem.allocineData.genre.id1 + ',' + dataForSingleItem.allocineData.genre.id2 + ',' + dataForSingleItem.allocineData.genre.id3;
            } else if (dataForSingleItem.allocineData.genre.id2 !== undefined) {
                genre = dataForSingleItem.allocineData.genre.id1 + ',' + dataForSingleItem.allocineData.genre.id2;
            } else if (dataForSingleItem.allocineData.genre.id1 !== undefined) {
                genre = dataForSingleItem.allocineData.genre.id1;
            } else {
                genre = 'Non renseigné';
            }
        } else {
            genre = 'Non renseigné';
        }

        if (dataForSingleItem.betaseriesData.network !== undefined) {
            if (dataForSingleItem.betaseriesData.network.id5 !== undefined) {
                network = dataForSingleItem.betaseriesData.network.id1 + ',' + dataForSingleItem.betaseriesData.network.id2 + ',' + dataForSingleItem.betaseriesData.network.id3 + ',' + dataForSingleItem.betaseriesData.network.id4 + ',' + dataForSingleItem.betaseriesData.network.id5;
            } else if (dataForSingleItem.betaseriesData.network.id4 !== undefined) {
                network = dataForSingleItem.betaseriesData.network.id1 + ',' + dataForSingleItem.betaseriesData.network.id2 + ',' + dataForSingleItem.betaseriesData.network.id3 + ',' + dataForSingleItem.betaseriesData.network.id4;
            } else if (dataForSingleItem.betaseriesData.network.id3 !== undefined) {
                network = dataForSingleItem.betaseriesData.network.id1 + ',' + dataForSingleItem.betaseriesData.network.id2 + ',' + dataForSingleItem.betaseriesData.network.id3;
            } else if (dataForSingleItem.betaseriesData.network.id2 !== undefined) {
                network = dataForSingleItem.betaseriesData.network.id1 + ',' + dataForSingleItem.betaseriesData.network.id2;
            } else if (dataForSingleItem.betaseriesData.network.id1 !== undefined) {
                network = dataForSingleItem.betaseriesData.network.id1;
            } else {
                network = 'Non renseignée';
            }
        } else {
            network = 'Non renseignée';
        }

        if (dataForSingleItem.betaseriesData.networkUrl !== undefined) {
            if (dataForSingleItem.betaseriesData.networkUrl.id5 !== undefined) {
                networkUrl = dataForSingleItem.betaseriesData.networkUrl.id1 + ',' + dataForSingleItem.betaseriesData.networkUrl.id2 + ',' + dataForSingleItem.betaseriesData.networkUrl.id3 + ',' + dataForSingleItem.betaseriesData.networkUrl.id4 + ',' + dataForSingleItem.betaseriesData.networkUrl.id5;
            } else if (dataForSingleItem.betaseriesData.networkUrl.id4 !== undefined) {
                networkUrl = dataForSingleItem.betaseriesData.networkUrl.id1 + ',' + dataForSingleItem.betaseriesData.networkUrl.id2 + ',' + dataForSingleItem.betaseriesData.networkUrl.id3 + ',' + dataForSingleItem.betaseriesData.networkUrl.id4;
            } else if (dataForSingleItem.betaseriesData.networkUrl.id3 !== undefined) {
                networkUrl = dataForSingleItem.betaseriesData.networkUrl.id1 + ',' + dataForSingleItem.betaseriesData.networkUrl.id2 + ',' + dataForSingleItem.betaseriesData.networkUrl.id3;
            } else if (dataForSingleItem.betaseriesData.networkUrl.id2 !== undefined) {
                networkUrl = dataForSingleItem.betaseriesData.networkUrl.id1 + ',' + dataForSingleItem.betaseriesData.networkUrl.id2;
            } else if (dataForSingleItem.betaseriesData.networkUrl.id1 !== undefined) {
                networkUrl = dataForSingleItem.betaseriesData.networkUrl.id1;
            } else {
                networkUrl = 'Non renseignée';
            }
        } else {
            networkUrl = 'Non renseignée';
        }

        if (dataForSingleItem.allocineData.nationality !== undefined) {
            if (dataForSingleItem.allocineData.nationality.id3 !== undefined) {
                nationality = dataForSingleItem.allocineData.nationality.id1 + ',' + dataForSingleItem.allocineData.nationality.id2 + ',' + dataForSingleItem.allocineData.nationality.id3;
            } else if (dataForSingleItem.allocineData.nationality.id2 !== undefined) {
                nationality = dataForSingleItem.allocineData.nationality.id1 + ',' + dataForSingleItem.allocineData.nationality.id2;
            } else if (dataForSingleItem.allocineData.nationality.id1 !== undefined) {
                nationality = dataForSingleItem.allocineData.nationality.id1;
            } else {
                nationality = 'Non renseignée';
            }
        } else {
            nationality = 'Non renseignée';
        }

        if (dataForSingleItem.allocineData.duration !== undefined) {
            if (parseInt(dataForSingleItem.allocineData.duration) <= 20) {
                duration = '20 minutes et moins';
            } else if (parseInt(dataForSingleItem.allocineData.duration) <= 30) {
                duration = 'De 20 à 30 minutes';
            } else if (parseInt(dataForSingleItem.allocineData.duration) <= 40) {
                duration = 'De 30 à 40 minutes';
            } else if (parseInt(dataForSingleItem.allocineData.duration) <= 50) {
                duration = 'De 40 à 50 minutes';
            } else if (parseInt(dataForSingleItem.allocineData.duration) <= 60) {
                duration = 'De 50 à 60 minutes';
            } else if (parseInt(dataForSingleItem.allocineData.duration) > 60) {
                duration = 'Plus de 60 minutes';
            } else {
                duration = 'Non renseignée';
            }
        } else {
            duration = 'Non renseignée';
        }

        var dateFormatted = '';
        if (date != '') {
            dateTemp = date.replace('.', '');
            dateFormatted = splitDate(dateTemp);
        } else {
            dateFormatted = '01/01/1970';
        }

        var today = new Date();
        var todayNewTemp = String(today);
        var todayNew = splitDate(todayNewTemp);
        today.setDate(today.getDate() - 30);
        var last30Days = ((today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear());
        var isDateIncludedlast30Days = dateCheck(last30Days, todayNew, dateFormatted);

        var today2 = new Date();
        var todayNewTemp2 = String(today2);
        var todayNew2 = splitDate(todayNewTemp2);
        today2.setDate(today2.getDate() - 182);
        var last6Months = ((today2.getMonth() + 1) + '/' + today2.getDate() + '/' + today2.getFullYear());
        var isDateIncludedlast6Months = dateCheck(last6Months, todayNew2, dateFormatted);

        var isDateIncluded2019 = dateCheck('01/01/2019', '12/31/2019', dateFormatted);
        var isDateIncluded2020 = dateCheck('01/01/2020', '12/31/2020', dateFormatted);
        var isDateIncluded2021 = dateCheck('01/01/2021', '12/31/2021', dateFormatted);

        dateFormattedFilter = statusFilter(
            isDateIncludedlast30Days,
            isDateIncludedlast6Months,
            isDateIncluded2019,
            isDateIncluded2020,
            isDateIncluded2021,
            status);

        critic = getActiveCritics(criticFix, criticNames);
        if (user == '') user = 0;
        if (imdbRating == '') imdbRating = 0;
        var betaseriesRating = betaseriesRatingTemp.replace(',', '.');
        if (betaseriesRating == '') betaseriesRating = 0;

        var criticActive = localStorage.getItem('yqcs_critic.' + 'criticAllocine');
        var userActive = localStorage.getItem('yqcs_critic.' + 'usersAllocine');
        var usersImdbActive = localStorage.getItem('yqcs_critic.' + 'usersImdb');
        var usersBetaseriesActive = localStorage.getItem('yqcs_critic.' + 'usersBetaseries');

        var userInput = document.querySelector('.nav-item.usersAllocine');
        var userImdbInput = document.querySelector('.nav-item.usersImdb');
        var userBetaseriesInput = document.querySelector('.nav-item.usersBetaseries');

        ratingTempTotal = 0;
        divisionNumber = 0;

        if (retrieveLocalData(criticActive)) {
            divisionNumber++;
            if (critic == 0) {
                divisionNumber--;
                criticDetails = '/';
            } else {
                criticDetails = parseFloat(critic).toFixed(2).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1') + '<span>/5</span>';
            }

            ratingTempTotal += parseFloat(critic);
        } else {
            criticDetails = '/';
            criticInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
        }

        if (retrieveLocalData(userActive)) {
            divisionNumber++;
            if (user == 0) {
                divisionNumber--;
                userDetails = '/';
            } else {
                userDetails = user + '<span>/5</span>';
            }

            ratingTempTotal += parseFloat(user);

            userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber">1</span>';
        } else {
            userDetails = '/';
            userInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber criticNumberZero">0</span>';
        }

        if (retrieveLocalData(usersImdbActive)) {
            divisionNumber++;
            if (imdbRating == 0) {
                divisionNumber--;
                imdbDetails = '/';
            } else {
                imdbDetails = imdbRating + '<span>/10</span>';
            }

            ratingTempTotal += parseFloat(imdbRating / 2);

            imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber">1</span>';
        } else {
            imdbDetails = '/';
            userImdbInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber criticNumberZero">0</span>';
        }

        if (retrieveLocalData(usersBetaseriesActive)) {
            divisionNumber++;
            if (betaseriesRating == 0) {
                divisionNumber--;
                betaseriesDetails = '/';
            } else {
                betaseriesDetails = betaseriesRating + '<span>/5</span>';
            }

            ratingTempTotal += parseFloat(betaseriesRating);

            betaseriesUserRatingLi.children[1].children[0].innerHTML = '<i class="icon-betaseries"></i> Spectateurs Betaseries<span class="criticNumber">1</span>';
        } else {
            betaseriesDetails = '/';
            userBetaseriesInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            betaseriesUserRatingLi.children[1].children[0].innerHTML = '<i class="icon-betaseries"></i> Spectateurs Betaseries<span class="criticNumber criticNumberZero">0</span>';
        }

        ratingTemp = ratingTempTotal / divisionNumber;

        ratingTemp = ratingTemp || 0;
        ratingToFixed = ratingTemp.toFixed(2);
        ratingToFixedOne = parseInt(ratingToFixed, 10);
        rating = ratingToFixed.replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1') + '<span>/5</span>';

        if (titleTemp.length > 15) {
            title = titleTemp.substring(0, 14) + '...';
        } else {
            title = dataForSingleItem.allocineData.title;
        }

        var titleTwitter = titleTemp.replace('&amp;', '%26');
        var ratingTwitter = rating
            .replace('<span>/5</span>', '')
            .replace('.', ',');
        if (parseInt(serieId) == 1) {
            localStorage.setItem('yqcs_twitter.' + 'title1', titleTwitter);
            localStorage.setItem('yqcs_twitter.' + 'rating1', ratingTwitter);
        }

        if (parseInt(serieId) == 2) {
            localStorage.setItem('yqcs_twitter.' + 'title2', titleTwitter);
            localStorage.setItem('yqcs_twitter.' + 'rating2', ratingTwitter);
        }

        if (parseInt(serieId) == 3) {
            localStorage.setItem('yqcs_twitter.' + 'title3', titleTwitter);
            localStorage.setItem('yqcs_twitter.' + 'rating3', ratingTwitter);
        }

        if (parseInt(serieId) == 4) {
            var title1 = localStorage.getItem('yqcs_twitter.' + 'title1');
            var rating1 = localStorage.getItem('yqcs_twitter.' + 'rating1');
            var title2 = localStorage.getItem('yqcs_twitter.' + 'title2');
            var rating2 = localStorage.getItem('yqcs_twitter.' + 'rating2');
            var title3 = localStorage.getItem('yqcs_twitter.' + 'title3');
            var rating3 = localStorage.getItem('yqcs_twitter.' + 'rating3');
            twitterTops(title1, rating1, title2, rating2, title3, rating3);
        }

        var criticDetailsUrl = '';
        if (criticDetails == '/') {
            criticDetailsUrl = '<a href="javascript:void(0)"><i class="fas fa-newspaper"></i>' + criticDetails + '</a>';
        } else {
            criticDetailsUrl = '<a href="https://www.allocine.fr/series/ficheserie-' + urlId + '/critiques/presse/" target="_blank"><i class="fas fa-newspaper"></i>' + criticDetails + '</a>';
        }

        var userDetailsUrl = '';
        if (userDetails == '/') {
            userDetailsUrl = '<a href="javascript:void(0)"><i class="fas fa-users"></i>' + userDetails + '</a>';
        } else {
            userDetailsUrl = '<a href="https://www.allocine.fr/series/ficheserie-' + urlId + '/critiques/" target="_blank"><i class="fas fa-users"></i>' + userDetails + '</a>';
        }

        var imdbDetailsUrl = '';
        if (imdbDetails == '/') {
            imdbDetailsUrl = '<a href="javascript:void(0)"><i class="fab fa-imdb"></i>' + imdbDetails + '</a>';
        } else {
            imdbDetailsUrl = '<a href="https://www.imdb.com/title/' + imdbId + '/" target="_blank"><i class="fab fa-imdb"></i>' + imdbDetails + '</a>';
        }

        var betaseriesDetailsUrl = '';
        if (betaseriesDetails == '/') {
            betaseriesDetailsUrl = '<a href="javascript:void(0)"><i class="icon-betaseries"></i>' + betaseriesDetails + '</a>';
        } else {
            betaseriesDetailsUrl = '<a href="https://www.betaseries.com/serie/' + betaseriesId + '/" target="_blank"><i class="icon-betaseries"></i>' + betaseriesDetails + '</a>';
        }

        /* beautify ignore:start */
        return [
            '<figure class="col-3@xs col-4@sm col-3@md picture-item shuffle-item shuffle-item--visible" data-genre="' + genre + '" data-network="' + network + '" data-network-url="' + networkUrl + '" data-nationality="' + nationality + '" data-duration="' + duration + '" data-date-formatted="' + dateFormattedFilter + '" data-stars="' + ratingToFixedOne + '" data-critic="' + ratingToFixed + '" data-seasons-critic="' + seasonsCriticArray +  '" data-seasons-critic-details="' + seasonsCriticDetailsArray + '" data-popularity="' + serieId + '" data-creationdate="' + creationDate + '" data-serieTrailerId="' + serieTrailerId + '" style="position: absolute; top: 0px; left: 0px; visibility: visible; will-change: transform; opacity: 1; transition-duration: 250ms; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-property: transform, opacity;">',
                '<div class="picture-item__inner">',
                    '<div class="aspect aspect--16x9">',
                        '<div class="aspect__inner">',
                            '<a href="javascript:void(0)" title="' + dataForSingleItem.allocineData.title + '">',
                                '<img src="' + picture + '" srcset="' + picture + '" alt="' + title + '">',
                            '</a>',
                            '<img class="picture-item__blur" src="' + picture + '" srcset="' + picture + '" alt="">',
                            '<div class="aspect__inner overlayInfos displayNone">',
                                criticDetailsUrl,
                                userDetailsUrl,
                                imdbDetailsUrl,
                                betaseriesDetailsUrl,
                            '</div>',
                            '<div class="aspect__inner overlayMoreInfos displayNone">',
                                '<a href="javascript:void(0)" class="read-more">Plus d\'infos</a>',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div class="picture-item__details">',
                        '<figcaption class="picture-item__title">',
                            '<a href="' + url + '" target="_blank" rel="noopener" title="' + dataForSingleItem.allocineData.title + '">' + title + '</a>',
                        '</figcaption>',
                        '<a href="javascript:void(0)">',
                            '<p class="picture-item__tags">' + rating + '</p>',
                        '</a>',
                    '</div>',
                '</div>',
            '</figure>'
        ].join('');
        /* beautify ignore:end */
    }

    // Return seasons critic values
    function getseasonsCritic(seasonsCritic) {
        if (seasonsCritic != undefined) {
            var seasonsCriticLength = Object.keys(seasonsCritic).length;
            var seasonsCriticArrayTemp = [];
            for (var seasonsCriticIndex = 1; seasonsCriticIndex <= seasonsCriticLength; seasonsCriticIndex++) {
                var seasonsCriticValue = seasonsCritic['id' + seasonsCriticIndex];
                seasonsCriticArrayTemp.push(seasonsCriticValue);
            }

            return seasonsCriticArrayTemp;
        }
    }

    // Remove accents from characters
    function normalizeStr(str) {
        var map = {
            '_': ' |-',
            'a': 'ä|á|à|ã|â|Ä|À|Á|Ã|Â',
            'e': 'ë|é|è|ê|Ë|É|È|Ê',
            'i': 'ï|í|ì|î|Ï|Í|Ì|Î',
            'o': 'ö|ó|ò|ô|õ|Ö|Ó|Ò|Ô|Õ',
            'u': 'ú|ù|û|ü|Ú|Ù|Û|Ü',
            'c': 'ç|Ç',
            'n': 'ñ|Ñ'
        };

        if (str != null) {
            for (var pattern in map) {
                str = str.replace(new RegExp(map[pattern], 'g'), pattern);
            }
        }

        return str;
    }

    // Change french date format to mm/dd/yyyy
    function splitDate(date) {
        var newDate = date.split(' ');
        var altFormat = true;

        switch (newDate[1]) {
            case 'Jan':
                newDate[1] = '01';
                break;
            case 'Feb':
                newDate[1] = '02';
                break;
            case 'Mar':
                newDate[1] = '03';
                break;
            case 'Apr':
                newDate[1] = '04';
                break;
            case 'May':
                newDate[1] = '05';
                break;
            case 'Jun':
                newDate[1] = '06';
                break;
            case 'Jul':
                newDate[1] = '07';
                break;
            case 'Aug':
                newDate[1] = '08';
                break;
            case 'Sep':
                newDate[1] = '09';
                break;
            case 'Oct':
                newDate[1] = '10';
                break;
            case 'Nov':
                newDate[1] = '11';
                break;
            case 'Dec':
                newDate[1] = '12';
                break;
            default:
                newDate[1] = '';
                break;
        }

        if (newDate[0] == 'Mon' ||
            newDate[0] == 'Tue' ||
            newDate[0] == 'Wed' ||
            newDate[0] == 'Thu' ||
            newDate[0] == 'Fri' ||
            newDate[0] == 'Sat' ||
            newDate[0] == 'Sun') {
            altFormat = false;
        }

        if (altFormat) {
            return newDate[1] + '/' + newDate[0] + '/' + newDate[2];
        } else {
            return newDate[1] + '/' + newDate[2] + '/' + newDate[3];
        }
    }

    // Parse start date, end date and date to check
    function dateCheck(firstDate, lastDate, dateToCheck) {
        var firstDateNew, lastDateNew, dateToCheckNew;

        firstDateNew = Date.parse(firstDate);
        lastDateNew = Date.parse(lastDate);
        dateToCheckNew = Date.parse(dateToCheck);

        return (dateToCheckNew <= lastDateNew && dateToCheckNew >= firstDateNew);
    }

    // Return status for filtering
    function statusFilter(
        isDateIncludedlast30Days,
        isDateIncludedlast6Months,
        isDateIncluded2019,
        isDateIncluded2020,
        isDateIncluded2021,
        status) {
        var text = '',
            text2 = '',
            text3 = '';

        if (isDateIncludedlast30Days) {
            text = 'Les 30 derniers jours,Les 6 derniers mois';
        } else if (isDateIncludedlast6Months) {
            text = 'Les 6 derniers mois';
        } else {
            text = '';
        }

        if (isDateIncluded2021) {
            text2 = 'En 2021';
        } else if (isDateIncluded2020) {
            text2 = 'En 2020';
        } else if (isDateIncluded2019) {
            text2 = 'En 2019';
        } else {
            text2 = '';
        }

        if (status == 'En cours') {
            text3 = 'En cours';
        } else if (status == 'Terminée') {
            text3 = 'Terminée';
        } else if (status == 'À venir') {
            text3 = 'À venir';
        } else if (status == 'Annulée') {
            text3 = 'Annulée';
        } else {
            text3 = '';
        }

        if (text == '') {
            return text2 + ',' + text3;
        } else if (text2 == '') {
            return text + ',' + text3;
        } else if (text3 == '') {
            return text + ',' + text2;
        } else if (text == '' && text2 == '') {
            return text3;
        } else if (text2 == '' && text3 == '') {
            return text;
        } else if (text3 == '' && text == '') {
            return text2;
        } else {
            return text + ',' + text2 + ',' + text3;
        }
    }

    // Return active critics
    function getActiveCritics(criticFix, criticNames) {
        var critic = 0;
        var criticNumber = 0;
        var res = 0;
        var buttonCriticNameNew;

        if (Object.keys(criticNames).length > 0) {
            criticArray.forEach(function(button) {
                var buttonCriticName = button.children[0].children[0].textContent;
                var localbuttonCriticName = localStorage.getItem('yqcs_critic.' + buttonCriticName);
                var last7Char = buttonCriticName.substr(buttonCriticName.length - 7);

                if (last7Char == ' Contre') {
                    buttonCriticNameTemp = buttonCriticName.replace(' Contre', '2');
                } else {
                    buttonCriticNameTemp = buttonCriticName;
                }

                buttonCriticNameNew = buttonCriticNameTemp.replace('\'', '&#039;');

                if (localbuttonCriticName == 'true' && criticNames[buttonCriticNameNew] != undefined) {
                    res += parseFloat(criticNames[buttonCriticNameNew]);
                    criticNumber++;
                } else if (localbuttonCriticName == null) {
                    criticNull = true;
                }
            });

            if (criticNull) {
                critic = criticFix;
            } else {
                critic = parseFloat(res / criticNumber);
                critic = critic || 0;
            }
        } else {
            critic = 0;
        }

        return critic;
    }

    // Set yqcs_localStorage for critic and user main buttons
    function retrieveLocalData(item) {
        if (item == 'true') {
            return true;
        } else if (item == 'false') {
            return false;
        } else {
            localStorage.setItem('yqcs_critic.' + 'criticAllocine', 'true');
            localStorage.setItem('yqcs_critic.' + 'usersAllocine', 'true');
            localStorage.setItem('yqcs_critic.' + 'usersImdb', 'true');
            localStorage.setItem('yqcs_critic.' + 'usersBetaseries', 'true');
            return true;
        }
    }

    // Send top titles and ratings to Twitter new tweet
    function twitterTops(title1, rating1, title2, rating2, title3, rating3) {
        var date = new Date();
        var weekdate = date.getDay();
        var day = date.getDate();
        var month = date.getMonth();
        var year = date.getFullYear();
        var monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        var weekdateNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

        var text = '';
        text += '🏆 Top 3 des séries les plus vues sur 🎬 %23AlloCiné le ' + weekdateNames[weekdate] + ' ' + day + ' ' + monthNames[month] + ' ' + year + ' !';
        text += '%0a%0a🥇 %23' + hashtagFormatted(title1) + ' avec ' + rating1 + '⭐️ /5';
        text += '%0a🥈 %23' + hashtagFormatted(title2) + ' avec ' + rating2 + '⭐️ /5';
        text += '%0a🥉 %23' + hashtagFormatted(title3) + ' avec ' + rating3 + '⭐️ /5';
        text += '%0a%0aEt vous, quelle est votre série du moment ?';
        text += '%0a%0ahttps://yaquoicommeserie.fr';
        text += '%0a%0a%23YQCS';

        var twitterButton = document.querySelector('.fa-twitter');
        var twitterButtonParent = document.querySelector('.fa-twitter').parentNode;
        twitterButton.addEventListener('click', function() {
            twitterButtonParent.href = 'https://twitter.com/intent/tweet?text=' + text;
        }, false);
    }

    // Remove characters for hashtags
    function hashtagFormatted(string) {
        return string
            .replace(/\s+/g, '')
            .replace('\'', '')
            .replace('?', '')
            .replace(',', '');
    }

    // Display retrieved data in grid div
    function appendMarkupToGrid(markup) {
        gridContainerElement.insertAdjacentHTML('beforeend', markup);
    }

    // Remove yqcs_localStorage items
    function removeItems() {
        localStorage.removeItem('yqcs_sort.' + 'critic');
        localStorage.removeItem('yqcs_sort.' + 'creationdate');
        localStorage.removeItem('yqcs_sort.' + 'popularity');
    }

    // Search function
    function addSearchFilter() {
        var searchInput = document.querySelector('.js-shuffle-search');
        var searchParam = paramsURL('recherche');

        if (!searchInput) {
            return;
        }

        if (paramsURLCheck('recherche')) {
            setTimeout(function() {
                document.querySelector('.js-shuffle-search').value = searchParam;
                handleSearchKeyup(searchParam);
            }, 200);
        }

        searchInput.addEventListener('input', handleSearchKeyup.bind(this));
    }

    // Add keyup listeners for search
    function handleSearchKeyup(evt) {
        var searchText;

        if (evt.target == undefined) {
            searchText = evt;
        } else {
            searchText = evt.target.value.toLowerCase();
        }

        shuffleInstance.filter(function(element, shuffle) {

            if (shuffle.group !== Shuffle.ALL_ITEMS) {
                var groups = JSON.parse(element.getAttribute('data-groups'));
                var isElementInCurrentGroup = groups.indexOf(shuffle.group) !== -1;

                if (!isElementInCurrentGroup) {
                    return false;
                }
            }

            var titleElement = element.querySelector('.picture-item__title');
            var titleText = titleElement.textContent.toLowerCase().trim();

            return titleText.indexOf(searchText) !== -1;
        });
    }

    // Sort function
    function addSorting() {
        var buttonGroup = document.querySelector('.sort-options');

        if (!buttonGroup) {
            return;
        }

        buttonGroup.addEventListener('change', handleSortChange.bind(this));
    }

    // Add or remove active class for sort change
    function handleSortChange(evt) {
        var buttons = Array.from(evt.currentTarget.children);
        buttons.forEach(function(button) {
            if (button.querySelector('input').value === evt.target.value) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        var value = evt.target.value;
        var options = {};

        function sortByPopularity(element) {
            return parseInt(element.getAttribute('data-popularity'));
        }

        function sortByCreationDate(element) {
            return parseInt(element.getAttribute('data-creationdate')) + parseFloat(element.getAttribute('data-critic'));
        }

        function sortCritic(element) {
            return element.getAttribute('data-critic');
        }

        if (value === 'popularity') {
            var popularity = localStorage.getItem('yqcs_sort.' + 'popularity');

            if (popularity === 'true') {
                options = {
                    reverse: true,
                    by: sortByPopularity,
                };

                evt.target.parentNode.innerHTML = '<input type="radio" name="sort-value" value="popularity"> Popularité <i class="fas fa-arrow-up"></i>';
                localStorage.setItem('yqcs_sort.' + 'popularity', 'false');
                localStorage.removeItem('yqcs_sort.' + 'creationdate');
                localStorage.removeItem('yqcs_sort.' + 'critic');
                localStorage.setItem('yqcs_sort.' + 'defaultInput', 'popularity');
            } else {
                options = {
                    reverse: false,
                    by: sortByPopularity,
                };

                evt.target.parentNode.innerHTML = '<input type="radio" name="sort-value" value="popularity"> Popularité <i class="fas fa-arrow-down"></i>';
                localStorage.setItem('yqcs_sort.' + 'popularity', 'true');
                localStorage.removeItem('yqcs_sort.' + 'creationdate');
                localStorage.removeItem('yqcs_sort.' + 'critic');
                localStorage.setItem('yqcs_sort.' + 'defaultInput', 'popularity');
            }
        } else if (value === 'creationdate') {
            var creationdate = localStorage.getItem('yqcs_sort.' + 'creationdate');

            if (creationdate === 'true') {
                options = {
                    reverse: false,
                    by: sortByCreationDate,
                };

                evt.target.parentNode.innerHTML = '<input type="radio" name="sort-value" value="creationdate"> Date de création <i class="fas fa-arrow-up"></i>';
                localStorage.setItem('yqcs_sort.' + 'creationdate', 'false');
                localStorage.removeItem('yqcs_sort.' + 'popularity');
                localStorage.removeItem('yqcs_sort.' + 'critic');
                localStorage.setItem('yqcs_sort.' + 'defaultInput', 'creationdate');
            } else {
                options = {
                    reverse: true,
                    by: sortByCreationDate,
                };

                evt.target.parentNode.innerHTML = '<input type="radio" name="sort-value" value="creationdate"> Date de création <i class="fas fa-arrow-down"></i>';
                localStorage.setItem('yqcs_sort.' + 'creationdate', 'true');
                localStorage.removeItem('yqcs_sort.' + 'popularity');
                localStorage.removeItem('yqcs_sort.' + 'critic');
                localStorage.setItem('yqcs_sort.' + 'defaultInput', 'creationdate');
            }
        } else if (value === 'critic') {
            var critic = localStorage.getItem('yqcs_sort.' + 'critic');

            if (critic === 'true') {
                options = {
                    reverse: false,
                    by: sortCritic,
                };

                evt.target.parentNode.innerHTML = '<input type="radio" name="sort-value" value="critic"> Note <i class="fas fa-arrow-up"></i>';
                localStorage.setItem('yqcs_sort.' + 'critic', 'false');
                localStorage.removeItem('yqcs_sort.' + 'popularity');
                localStorage.removeItem('yqcs_sort.' + 'creationdate');
                localStorage.setItem('yqcs_sort.' + 'defaultInput', 'critic');
            } else {
                options = {
                    reverse: true,
                    by: sortCritic,
                };

                evt.target.parentNode.innerHTML = '<input type="radio" name="sort-value" value="critic"> Note <i class="fas fa-arrow-down"></i>';
                localStorage.setItem('yqcs_sort.' + 'critic', 'true');
                localStorage.removeItem('yqcs_sort.' + 'popularity');
                localStorage.removeItem('yqcs_sort.' + 'creationdate');
                localStorage.setItem('yqcs_sort.' + 'defaultInput', 'critic');
            }
        }

        shuffleInstance.sort(options);
    }

    // Set active period filter
    function addPeriodFilter() {
        var activePeriod = normalizeStr(paramsURL('diffusion'));

        if (activePeriod == 'les_30_derniers_jours') {
            activePeriod = 'Les 30 derniers jours';
        } else if (activePeriod == 'les_6_derniers_mois') {
            activePeriod = 'Les 6 derniers mois';
        } else if (activePeriod == 'en_2021' || activePeriod == '2021') {
            activePeriod = 'En 2021';
        } else if (activePeriod == 'en_2020' || activePeriod == '2020') {
            activePeriod = 'En 2020';
        } else if (activePeriod == 'en_2019' || activePeriod == '2019') {
            activePeriod = 'En 2019';
        } else if (activePeriod == 'en_cours') {
            activePeriod = 'En cours';
        } else if (activePeriod == 'terminee') {
            activePeriod = 'Terminée';
        } else {
            activePeriod = localStorage.getItem('yqcs_period.' + 'activePeriod');
            if (activePeriod == null) {
                activePeriod = 'En 2021';
            }
        }

        setTimeout(function() {
            periodOption.value = activePeriod;
            periodOption.options[periodOption.selectedIndex].setAttribute('selected', 'selected');
            localStorage.setItem('yqcs_period.' + 'activePeriod', activePeriod);
            handleOptionChange();
        }, 100);
    }

    // Get current option filters and filter
    function handleOptionChange() {
        filters.periodArray = getCurrentOptionFilters();

        if (filters.periodArray == 'NoFilter') filters.periodArray = [];

        filter();
    }

    // Return selected option value
    function getCurrentOptionFilters() {
        return periodArray.filter(function(option) {
            return option.selected;
        }).map(function(option) {
            return option.value;
        });
    }

    // Add events on options changes and buttons clicks
    function bindPeriodAndGenreListeners() {
        periodOption.addEventListener('change', function() {
            periodOption.options[periodOption.selectedIndex].setAttribute('selected', 'selected');
            handleOptionChange();
            activePeriod = periodOption.options[periodOption.selectedIndex].value;
            localStorage.setItem('yqcs_period.' + 'activePeriod', activePeriod);
        });

        genreArray.forEach(function(button) {
            button.addEventListener('click', handleButtonChange.bind(this));
        }, false);
    }

    // Handle button change with additive and exclusive mode
    function handleButtonChange(evt) {
        var mode = localStorage.getItem('yqcs_mode.' + 'mode');

        if (mode == undefined) {
            localStorage.setItem('yqcs_mode.' + 'mode', 'exclusive');
        }

        var btn = evt.currentTarget;
        var isActive = btn.classList.contains('active');
        var btnGroup = btn.getAttribute('data-group');

        if (mode === 'additive') {
            if (isActive) {
                filters.genreArray.splice(filters.genreArray.indexOf(btnGroup), 1);
            } else {
                filters.genreArray.push(btnGroup);
            }

            btn.classList.toggle('active');

            filter();

        } else {
            removeActiveClassFromChildren(btn.parentNode);

            if (isActive) {
                btn.classList.remove('active');
                filters.genreArray = [];
            } else {
                btn.classList.add('active');
                filters.genreArray = getCurrentButtonFilters();
            }

            filter();
        }
    }

    // Remove active class from children
    function removeActiveClassFromChildren(parent) {
        var children = parent.children;
        for (var i = children.length - 1; i >= 0; i--) {
            children[i].classList.remove('active');
        }
    }

    // Get current button filters
    function getCurrentButtonFilters() {
        return genreArray.filter(function(button) {
            return button.classList.contains('active');
        }).map(function(button) {
            return button.getAttribute('data-group');
        });
    }

    // Filter matching items
    function filter() {
        if (hasActiveFilters()) {
            shuffleInstance.filter(itemPassesFilters.bind(this));
        } else {
            shuffleInstance.filter(Shuffle.ALL_ITEMS);
        }
    }

    // Check active filters length
    function hasActiveFilters() {
        return Object.keys(filters).some(function(key) {
            return filters[key].length > 0;
        }, this);
    }

    // Select matching items
    function itemPassesFilters(element) {
        var periodArray = filters.periodArray;
        var genreArray = filters.genreArray;
        var networkArray = filters.networkArray;
        var nationalityArray = filters.nationalityArray;
        var durationArray = filters.durationArray;
        var starsArray = filters.starsArray;
        var option = element.getAttribute('data-date-formatted');
        var optionNew = option.split(',');
        var button = element.getAttribute('data-genre');
        var buttonNew = button.split(',');
        var network = element.getAttribute('data-network');
        var networkNew = network.split(',');
        var nationality = element.getAttribute('data-nationality');
        var nationalityNew = nationality.split(',');
        var duration = element.getAttribute('data-duration');
        var durationNew = duration.split(',');
        var stars = element.getAttribute('data-stars');
        var starsNew = stars.split(',');

        if (periodArray.length > 0 && !periodArray.some(r => optionNew.includes(r))) {
            return false;
        }

        if (genreArray.length > 0 && !genreArray.some(r => buttonNew.includes(r))) {
            return false;
        }

        if (networkArray.length > 0 && !networkArray.some(r => networkNew.includes(r))) {
            return false;
        }

        if (nationalityArray.length > 0 && !nationalityArray.some(r => nationalityNew.includes(r))) {
            return false;
        }

        if (durationArray.length > 0 && !durationArray.some(r => durationNew.includes(r))) {
            return false;
        }

        if (starsArray.length > 0 && !starsArray.some(r => starsNew.includes(r))) {
            return false;
        }

        return true;
    }

    // Add additive/exclusive click listener
    function clickToggleMode() {
        var inputToggle = document.querySelector('#inputToggle');
        inputToggle.addEventListener('click', toggleMode, false);
    }

    // Set additive/exclusive toggle
    function toggleMode() {
        var mode = localStorage.getItem('yqcs_mode.' + 'mode');

        if (mode === 'additive') {
            localStorage.setItem('yqcs_mode.' + 'mode', 'exclusive');
        } else {
            localStorage.setItem('yqcs_mode.' + 'mode', 'additive');
        }
    }

    // Add click listener
    function darkmodePref() {
        tglDarkmode.addEventListener('click', toggleDarkmode, false);
    }

    // Trigger darkmode function
    function toggleDarkmode() {
        darkmode.toggle();
        getDarkmodeStatus();
    }

    // Display overlay with trailer
    function displayOverlay() {
        var imgsLink = document.querySelectorAll('.overlayMoreInfos');

        var slider = tns({
            'container': '#slider',
            'items': 1,
            'loop': false,
            'swipeAngle': false,
            'speed': 400,
            'controls': true,
            'controlsPosition': 'bottom',
            'controlsText': ['Précédent', 'Suivant'],
            'nav': false,
            'mouseDrag': true,
            'arrowKeys': true
        });

        imgsLink.forEach(function(link) {
            link.addEventListener('click', function() {
                document.querySelector('#overlay').style.display = 'block';
                document.body.style.overflow = 'hidden';

                slider.goTo(0);

                var seasonsCriticAttr = link.parentNode.parentNode.parentNode.parentNode.getAttribute('data-seasons-critic');
                var seasonsCriticDetailsAttr = link.parentNode.parentNode.parentNode.parentNode.getAttribute('data-seasons-critic-details');
                if (seasonsCriticAttr != '') {
                    document.querySelector('.third-slide .slide-unavailable').style.display = 'none';
                    document.querySelector('.third-slide .slide-available').style.display = 'block';

                    var seasonsCriticData = seasonsCriticAttr.split(',');
                    var seasonsCriticDataDetails = seasonsCriticDetailsAttr.split(',');
                    var seasonsCriticLabels = [];
                    for (var seasonsCriticAttrNewIndex = 1; seasonsCriticAttrNewIndex <= seasonsCriticData.length; seasonsCriticAttrNewIndex++) {
                        if (seasonsCriticAttrNewIndex == 1) {
                            seasonsCriticLabelsText = '1ère saison';
                        } else {
                            seasonsCriticLabelsText = seasonsCriticAttrNewIndex + 'ème';
                        }
                        seasonsCriticLabels.push(seasonsCriticLabelsText);
                    }
                    chartJSGraph(seasonsCriticData, seasonsCriticDataDetails, seasonsCriticLabels);
                } else {
                    document.querySelector('.third-slide .slide-unavailable').style.display = 'block';
                    document.querySelector('.third-slide .slide-available').style.display = 'none';
                }

                var serietrailerid = link.parentNode.parentNode.parentNode.parentNode.getAttribute('data-serietrailerid');
                var network = link.parentNode.parentNode.parentNode.parentNode.getAttribute('data-network').toLowerCase();
                var networkNew = network.split(',');
                var networkUrl = link.parentNode.parentNode.parentNode.parentNode.getAttribute('data-network-url');
                var networkUrlNew = networkUrl.split(',');

                document.querySelector('iframe').src = 'https://player.allocine.fr/' + serietrailerid + '.html';

                if (serietrailerid == '') {
                    document.querySelector('.slide-unavailable').style.display = 'block';
                    document.querySelector('p.slide-available').style.display = 'none';
                    document.querySelector('div.slide-available').style.display = 'none';
                } else {
                    document.querySelector('.slide-unavailable').style.display = 'none';
                    document.querySelector('p.slide-available').style.display = 'block';
                    document.querySelector('div.slide-available').style.display = 'block';
                }

                var htmlTag = '';
                if (networkNew.length > 0) {
                    htmlTag = '<p>Disponible sur</p>';
                    for (var htmlTagIndex = 0; htmlTagIndex < networkNew.length; htmlTagIndex++) {
                        if (networkUrlNew[htmlTagIndex] == 'Non renseignée') {
                            document.querySelector('.second-slide').style.display = '';
                            htmlTag = '<p class="second-slide-unavailable">Plateforme non renseignée <i>(pour l\'instant)</i></p>';
                        } else {
                            document.querySelector('.second-slide').style.display = 'inline-grid';
                            htmlTag += '<div><a href="' + networkUrlNew[htmlTagIndex] + '" target="_blank"><img src="assets/logo/' + normalizeStr(networkNew[htmlTagIndex]) + '.png" alt="' + normalizeStr(networkNew[htmlTagIndex]) + '"></a></div>';
                        }
                    }
                } else {
                    document.querySelector('.second-slide').style.display = '';
                    htmlTag = '<p class="second-slide-unavailable">Plateforme non renseignée <i>(pour l\'instant)</i></p>';
                }

                document.querySelector('.second-slide').innerHTML = htmlTag;
            }, false);
        });

        var overlay = document.querySelector('#overlay');
        overlay.addEventListener('click', function(e) {
            if (e.target.localName == 'div' ||
                e.target.id == 'close-button') {
                document.querySelector('#overlay').style.display = 'none';
                document.querySelector('iframe').src = '';
                document.body.style.overflow = 'scroll';
            }
        });
    }

    // Draw seasons critic graph
    function chartJSGraph(seasonsCriticData, seasonsCriticDataDetails, seasonsCriticLabels) {
        var paddingTopAndBottom = 0;
        var paddingLeftAndRight = 30;
        var width = window.innerWidth;
        if (width > 1100) {
            paddingTopAndBottom = 70;
            paddingLeftAndRight = 70;
        }
        var color = '#000';
        if (darkmode.isActivated()) {
            color = '#fff';
        }

        if (window.chart instanceof Chart) {
            window.chart.destroy();
        }

        var ctx = document.getElementById('chart').getContext('2d');
        var gradient = ctx.createLinearGradient(0, 0, 0, 450);
        gradient.addColorStop(0, 'rgba(40, 167, 69, 0.5)');
        gradient.addColorStop(0.5, 'rgba(40, 167, 69, 0.25)');
        gradient.addColorStop(1, 'rgba(40, 167, 69, 0)');
        var config = {
            type: 'line',
            data: {
                labels: seasonsCriticLabels,
                datasets: [{
                    label: 'Notes des saisons',
                    backgroundColor: gradient,
                    borderColor: '#28A745',
                    data: seasonsCriticData
                }]
            },

            options: {
                legend: {
                    labels: {
                        fontColor: color,
                        fontSize: 20
                    }
                },
                scales: {
                    y: {
                        max: 5,
                        min: 0,
                        ticks: {
                            fontColor: color,
                            fontSize: 15,
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            fontColor: color,
                            fontSize: 15
                        }
                    }
                },
                layout: {
                    padding: {
                        left: paddingLeftAndRight,
                        right: paddingLeftAndRight,
                        top: paddingTopAndBottom,
                        bottom: paddingTopAndBottom
                    }
                },
                tooltips: {
                    titleFontSize: 18,
                    bodyFontSize: 13,
                    displayColors: false,
                    borderColor: '#28A745',
                    borderWidth: 1,
                    callbacks: {
                        mode: 'index',
                        intersect: true,
                        title: function(tooltipItem, _data) {
                            for (var seasonsCriticDataIndex = 0; seasonsCriticDataIndex < seasonsCriticData.length; seasonsCriticDataIndex++) {
                                seasonsCriticData[seasonsCriticDataIndex] = seasonsCriticData[seasonsCriticDataIndex].replace('.', ',');
                            }
                            return seasonsCriticLabels[tooltipItem[0].index] + ' : ' + seasonsCriticData[tooltipItem[0].index] + '/5';
                        },
                        label: function(tooltipItem, _data) {
                            return seasonsCriticDataDetails[tooltipItem.index];
                        }
                    }
                }
            }
        };
        chart = new Chart(ctx, config);
    }

    // Get darkmode status and set icon
    function getDarkmodeStatus() {
        var body = document.body;
        var darkmodeActive = localStorage.getItem('yqcs_darkmode.' + 'darkmode');

        if (darkmodeActive == 'true' || body.classList.contains('darkmode--activated')) {
            tglDarkmode.classList.add('far');
            tglDarkmode.classList.remove('fas');
        } else {
            tglDarkmode.classList.remove('far');
            tglDarkmode.classList.add('fas');
        }
    }

    // Set on load default sort on critic
    function defaultInputClick() {
        removeItems();

        var activeSort = normalizeStr(paramsURL('trier_par'));
        if (activeSort == 'note') {
            localStorage.setItem('yqcs_sort.' + 'defaultInput', 'critic');
        } else if (activeSort == 'popularite') {
            localStorage.setItem('yqcs_sort.' + 'defaultInput', 'popularity');
        } else if (activeSort == 'date_de_creation' ||
            activeSort == 'date_creation' ||
            activeSort == 'creation') {
            localStorage.setItem('yqcs_sort.' + 'defaultInput', 'creationdate');
        } else {
            activeSort = localStorage.getItem('yqcs_sort.' + 'defaultInput');
            if (activeSort == null) {
                localStorage.setItem('yqcs_sort.' + 'defaultInput', 'critic');
            }
        }

        var defaultInput = localStorage.getItem('yqcs_sort.' + 'defaultInput');
        var defaultInputValue = document.getElementById('defaultInput' + defaultInput);
        defaultInputValue.click();
    }

    // Display shortcut on search input focus
    function focusSearchInput() {
        var shortcutId = document.getElementById('shortcut');
        var textfieldInput = document.querySelector('.textfield');

        textfieldInput.addEventListener('focus', function() {
            shortcutId.classList.remove('displayNone');
        });

        textfieldInput.addEventListener('focusout', function() {
            shortcutId.classList.add('displayNone');
        });
    }

    // Add click listener on menu toggles
    function getTglButtons() {
        var tglCriticArray = Array.from(document.querySelectorAll('.nav-item.mainToggle'));
        var tglNetworkArray = Array.from(document.querySelectorAll('.nav-item.mainToggleNetwork'));
        var tglNationalityArray = Array.from(document.querySelectorAll('.nav-item.mainToggleNationality'));
        var tglDurationArray = Array.from(document.querySelectorAll('.nav-item.mainToggleDuration'));
        var tglStarsArray = Array.from(document.querySelectorAll('.nav-item.mainToggleStars'));

        tglCriticArray.forEach(function(toggle) {
            toggle.children[0].children[0].addEventListener('click', toggleLocalData.bind(this), false);
        });

        tglNetworkArray.forEach(function(toggle) {
            toggle.children[0].children[0].addEventListener('click', toggleLocalData.bind(this), false);
        });

        tglNationalityArray.forEach(function(toggle) {
            toggle.children[0].children[0].addEventListener('click', toggleLocalData.bind(this), false);
        });

        tglDurationArray.forEach(function(toggle) {
            toggle.children[0].children[0].addEventListener('click', toggleLocalData.bind(this), false);
        });

        tglStarsArray.forEach(function(toggle) {
            toggle.children[0].children[0].addEventListener('click', toggleLocalData.bind(this), false);
        });
    }

    // Set yqcs_localStorage toggles
    function toggleLocalData(item) {
        var classListName = item.currentTarget.parentNode.parentNode.classList[1];
        var classListNameActive = localStorage.getItem('yqcs_critic.' + classListName);
        var getItemType = classListName.replace('mainToggle', '').toLowerCase();
        var classListNameActive2 = localStorage.getItem('yqcs_' + getItemType + '.' + classListName);

        if (classListName == 'criticAllocine' ||
            classListName == 'usersAllocine' ||
            classListName == 'usersImdb' ||
            classListName == 'usersBetaseries') {
            localStorage.setItem('yqcs_menu.' + 'menuBool', true);
        }

        if (classListName == 'criticAllocine') {
            if (classListNameActive == 'true') {
                item.currentTarget.innerHTML = 'Tout sélectionner<span><input id="criticToggle0" type="checkbox"><label for="criticToggle0"></label></span>';
                item.currentTarget.children[0].children[0].removeAttribute('checked');
                localStorage.setItem('yqcs_critic.' + classListName, 'false');
            } else {
                item.currentTarget.innerHTML = 'Tout désélectionner<span><input id="criticToggle0" type="checkbox"><label for="criticToggle0"></label></span>';
                item.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
                localStorage.setItem('yqcs_critic.' + classListName, 'true')
            }
        } else if (classListName == 'usersAllocine') {
            if (classListNameActive == 'true') {
                userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber criticNumberZero">0</span>';
                item.currentTarget.children[0].children[0].removeAttribute('checked');
                localStorage.setItem('yqcs_critic.' + classListName, 'false');
            } else {
                userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber">1</span>';
                item.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
                localStorage.setItem('yqcs_critic.' + classListName, 'true')
            }
        } else if (classListName == 'usersImdb') {
            if (classListNameActive == 'true') {
                imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber criticNumberZero">0</span>';
                item.currentTarget.children[0].children[0].removeAttribute('checked');
                localStorage.setItem('yqcs_critic.' + classListName, 'false');
            } else {
                imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber">1</span>';
                item.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
                localStorage.setItem('yqcs_critic.' + classListName, 'true')
            }
        } else if (classListName == 'usersBetaseries') {
            if (classListNameActive == 'true') {
                betaseriesUserRatingLi.children[1].children[0].innerHTML = '<i class="icon-betaseries"></i> Spectateurs Betaseries<span class="criticNumber criticNumberZero">0</span>';
                item.currentTarget.children[0].children[0].removeAttribute('checked');
                localStorage.setItem('yqcs_critic.' + classListName, 'false');
            } else {
                betaseriesUserRatingLi.children[1].children[0].innerHTML = '<i class="icon-betaseries"></i> Spectateurs Betaseries<span class="criticNumber">1</span>';
                item.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
                localStorage.setItem('yqcs_critic.' + classListName, 'true')
            }
        } else if (classListName == 'mainToggleNetwork') {
            if (classListNameActive2 == 'true') {
                item.currentTarget.innerHTML = 'Tout sélectionner<span><input id="networkButton0" type="checkbox"><label for="networkButton0"></label></span>';
                item.currentTarget.children[0].children[0].removeAttribute('checked');
                localStorage.setItem('yqcs_' + getItemType + '.' + classListName, 'false');
            } else {
                item.currentTarget.innerHTML = 'Tout désélectionner<span><input id="networkButton0" type="checkbox"><label for="networkButton0"></label></span>';
                item.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
                localStorage.setItem('yqcs_' + getItemType + '.' + classListName, 'true');
            }
        } else if (classListName == 'mainToggleNationality') {
            if (classListNameActive2 == 'true') {
                item.currentTarget.innerHTML = 'Tout sélectionner<span><input id="nationalityButton0" type="checkbox"><label for="nationalityButton0"></label></span>';
                item.currentTarget.children[0].children[0].removeAttribute('checked');
                localStorage.setItem('yqcs_' + getItemType + '.' + classListName, 'false');
            } else {
                item.currentTarget.innerHTML = 'Tout désélectionner<span><input id="nationalityButton0" type="checkbox"><label for="nationalityButton0"></label></span>';
                item.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
                localStorage.setItem('yqcs_' + getItemType + '.' + classListName, 'true');
            }
        } else if (classListName == 'mainToggleDuration') {
            if (classListNameActive2 == 'true') {
                item.currentTarget.innerHTML = 'Tout sélectionner<span><input id="durationButton0" type="checkbox"><label for="durationButton0"></label></span>';
                item.currentTarget.children[0].children[0].removeAttribute('checked');
                localStorage.setItem('yqcs_' + getItemType + '.' + classListName, 'false');
            } else {
                item.currentTarget.innerHTML = 'Tout désélectionner<span><input id="durationButton0" type="checkbox"><label for="durationButton0"></label></span>';
                item.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
                localStorage.setItem('yqcs_' + getItemType + '.' + classListName, 'true');
            }
        } else if (classListName == 'mainToggleStars') {
            if (classListNameActive2 == 'true') {
                item.currentTarget.innerHTML = 'Tout sélectionner<span><input id="starsButton0" type="checkbox"><label for="starsButton0"></label></span>';
                item.currentTarget.children[0].children[0].removeAttribute('checked');
                localStorage.setItem('yqcs_' + getItemType + '.' + classListName, 'false');
            } else {
                item.currentTarget.innerHTML = 'Tout désélectionner<span><input id="starsButton0" type="checkbox"><label for="starsButton0"></label></span>';
                item.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
                localStorage.setItem('yqcs_' + getItemType + '.' + classListName, 'true');
            }
        }
    }

    // Move to top of ul checked critics
    function menuButtonsChecked() {
        var menuAllChecked = document.querySelectorAll('.nav-item.criticButton:not(.mainToggle)');
        var menuAllCheckedArray = Array.from(menuAllChecked);
        var i = 1;

        menuAllCheckedArray.forEach(function(button) {
            var buttonCriticName = button.children[0].children[0].textContent;
            var localbuttonCriticName = localStorage.getItem('yqcs_critic.' + buttonCriticName);

            button.children[0].children[0].addEventListener('click', function() {
                var ulList = this.parentNode.parentNode.parentNode;
                var liItem = this.parentNode.parentNode;
                var secondListItem = this.parentNode.parentNode.parentNode.childNodes[1];
                if (this.children[0].children[0].getAttribute('checked') == 'checked') {
                    ulList.insertBefore(liItem, secondListItem);
                }
            }, false);

            if (localbuttonCriticName == 'true') {
                var ulListLoad = button.parentNode;
                var secondListItemLoad = button.parentNode.childNodes[i];
                ulListLoad.insertBefore(button, secondListItemLoad);
                i++;
            }
        });
    }

    // Set or unset active network on load
    function menuNetworkOnLoad() {
        networkArray.forEach(function(network) {
            network.children[0].children[0].addEventListener('click', setLocalStorageNetwork.bind(this), false);

            var buttonNetworkName = network.children[0].children[0].textContent;
            var localbuttonNetworkName = localStorage.getItem('yqcs_network.' + buttonNetworkName);

            if (localbuttonNetworkName == 'true' || localbuttonNetworkName == null) {
                networkNumberBool = true;
                localbuttonNetworkNameNumber++;
                if (localbuttonNetworkName == null) {
                    localStorage.setItem('yqcs_network.' + buttonNetworkName, 'true');
                }

                filters.networkArray.push(buttonNetworkName);

                filter();
            } else if (localbuttonNetworkName == 'false') {
                network.children[0].children[0].children[0].children[0].removeAttribute('checked');
            }
        });

        if (localbuttonNetworkNameNumber > 0) {
            networkLi.children[1].children[0].innerHTML = '<i class="fas fa-tv fa-lg"></i> Plateformes<span class="criticNumber">' + localbuttonNetworkNameNumber + '</span>';
        } else {
            networkLi.children[1].children[0].innerHTML = '<i class="fas fa-tv fa-lg"></i> Plateformes<span class="criticNumber criticNumberZero">0</span>';
        }

        if (networkNumberBool) {
            localStorage.setItem('yqcs_network.' + 'mainToggleNetwork', 'true');
            networkInput.children[0].children[0].innerHTML = 'Tout désélectionner<span><input id="networkButton0" type="checkbox" checked="checked"><label for="networkButton0"></label></span>';
        } else {
            localStorage.setItem('yqcs_network.' + 'mainToggleNetwork', 'false');
            networkInput.children[0].children[0].innerHTML = 'Tout sélectionner<span><input id="networkButton0" type="checkbox"><label for="networkButton0"></label></span>';
        }
    }

    // Set yqcs_localStorage for each network button
    function setLocalStorageNetwork(evt) {
        var buttonNetworkName = evt.currentTarget.textContent;
        var isActive = evt.currentTarget.children[0].children[0].getAttribute('checked');

        if (isActive == 'checked') {
            filters.networkArray.splice(filters.networkArray.indexOf(buttonNetworkName), 1);
            evt.currentTarget.children[0].children[0].removeAttribute('checked');
            localStorage.setItem('yqcs_network.' + buttonNetworkName, 'false');
            localbuttonNetworkNameNumber--;
        } else {
            filters.networkArray.push(buttonNetworkName);
            evt.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
            localStorage.setItem('yqcs_network.' + buttonNetworkName, 'true');
            localbuttonNetworkNameNumber++;
        }

        filter();

        if (localbuttonNetworkNameNumber > 0) {
            networkLi.children[1].children[0].innerHTML = '<i class="fas fa-tv fa-lg"></i> Plateforme<span class="criticNumber">' + localbuttonNetworkNameNumber + '</span>';
        } else {
            networkLi.children[1].children[0].innerHTML = '<i class="fas fa-tv fa-lg"></i> Plateforme<span class="criticNumber criticNumberZero">0</span>';
        }
    }

    // Set or unset active nationality on load
    function menuNationalityOnLoad() {
        nationalityArray.forEach(function(nationality) {
            nationality.children[0].children[0].addEventListener('click', setLocalStorageNationality.bind(this), false);

            var buttonNationalityName = nationality.children[0].children[0].textContent;
            var localbuttonNationalityName = localStorage.getItem('yqcs_nationality.' + buttonNationalityName);

            if (localbuttonNationalityName == 'true' || localbuttonNationalityName == null) {
                nationalityNumberBool = true;
                localbuttonNationalityNameNumber++;
                if (localbuttonNationalityName == null) {
                    localStorage.setItem('yqcs_nationality.' + buttonNationalityName, 'true');
                }

                filters.nationalityArray.push(buttonNationalityName);

                filter();
            } else if (localbuttonNationalityName == 'false') {
                nationality.children[0].children[0].children[0].children[0].removeAttribute('checked');
            }
        });

        if (localbuttonNationalityNameNumber > 0) {
            nationalityLi.children[1].children[0].innerHTML = '<i class="fas fa-flag fa-lg"></i> Nationalités<span class="criticNumber">' + localbuttonNationalityNameNumber + '</span>';
        } else {
            nationalityLi.children[1].children[0].innerHTML = '<i class="fas fa-flag fa-lg"></i> Nationalités<span class="criticNumber criticNumberZero">0</span>';
        }

        if (nationalityNumberBool) {
            localStorage.setItem('yqcs_nationality.' + 'mainToggleNationality', 'true');
            nationalityInput.children[0].children[0].innerHTML = 'Tout désélectionner<span><input id="nationalityButton0" type="checkbox" checked="checked"><label for="nationalityButton0"></label></span>';
        } else {
            localStorage.setItem('yqcs_nationality.' + 'mainToggleNationality', 'false');
            nationalityInput.children[0].children[0].innerHTML = 'Tout sélectionner<span><input id="nationalityButton0" type="checkbox"><label for="nationalityButton0"></label></span>';
        }
    }

    // Set yqcs_localStorage for each nationality button
    function setLocalStorageNationality(evt) {
        var buttonNationalityName = evt.currentTarget.textContent;
        var isActive = evt.currentTarget.children[0].children[0].getAttribute('checked');

        if (isActive == 'checked') {
            filters.nationalityArray.splice(filters.nationalityArray.indexOf(buttonNationalityName), 1);
            evt.currentTarget.children[0].children[0].removeAttribute('checked');
            localStorage.setItem('yqcs_nationality.' + buttonNationalityName, 'false');
            localbuttonNationalityNameNumber--;
        } else {
            filters.nationalityArray.push(buttonNationalityName);
            evt.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
            localStorage.setItem('yqcs_nationality.' + buttonNationalityName, 'true');
            localbuttonNationalityNameNumber++;
        }

        filter();

        if (localbuttonNationalityNameNumber > 0) {
            nationalityLi.children[1].children[0].innerHTML = '<i class="fas fa-flag fa-lg"></i> Nationalités<span class="criticNumber">' + localbuttonNationalityNameNumber + '</span>';
        } else {
            nationalityLi.children[1].children[0].innerHTML = '<i class="fas fa-flag fa-lg"></i> Nationalités<span class="criticNumber criticNumberZero">0</span>';
        }
    }

    // Set or unset active duration on load
    function menuDurationOnLoad() {
        durationArray.forEach(function(duration) {
            duration.children[0].children[0].addEventListener('click', setLocalStorageDuration.bind(this), false);

            var buttonDurationName = duration.children[0].children[0].textContent;
            var localbuttonDurationName = localStorage.getItem('yqcs_duration.' + buttonDurationName);

            if (localbuttonDurationName == 'true' || localbuttonDurationName == null) {
                durationNumberBool = true;
                localbuttonDurationNameNumber++;
                if (localbuttonDurationName == null) {
                    localStorage.setItem('yqcs_duration.' + buttonDurationName, 'true');
                }

                filters.durationArray.push(buttonDurationName);

                filter();
            } else if (localbuttonDurationName == 'false') {
                duration.children[0].children[0].children[0].children[0].removeAttribute('checked');
            }
        });

        if (localbuttonDurationNameNumber > 0) {
            durationLi.children[1].children[0].innerHTML = '<i class="fas fa-clock fa-lg"></i> Durées<span class="criticNumber">' + localbuttonDurationNameNumber + '</span>';
        } else {
            durationLi.children[1].children[0].innerHTML = '<i class="fas fa-clock fa-lg"></i> Durées<span class="criticNumber criticNumberZero">0</span>';
        }

        if (durationNumberBool) {
            localStorage.setItem('yqcs_duration.' + 'mainToggleDuration', 'true');
            durationInput.children[0].children[0].innerHTML = 'Tout désélectionner<span><input id="durationButton0" type="checkbox" checked="checked"><label for="durationButton0"></label></span>';
        } else {
            localStorage.setItem('yqcs_duration.' + 'mainToggleDuration', 'false');
            durationInput.children[0].children[0].innerHTML = 'Tout sélectionner<span><input id="durationButton0" type="checkbox"><label for="durationButton0"></label></span>';
        }
    }

    // Set yqcs_localStorage for each duration button
    function setLocalStorageDuration(evt) {
        var buttonDurationName = evt.currentTarget.textContent;
        var isActive = evt.currentTarget.children[0].children[0].getAttribute('checked');

        if (isActive == 'checked') {
            filters.durationArray.splice(filters.durationArray.indexOf(buttonDurationName), 1);
            evt.currentTarget.children[0].children[0].removeAttribute('checked');
            localStorage.setItem('yqcs_duration.' + buttonDurationName, 'false');
            localbuttonDurationNameNumber--;
        } else {
            filters.durationArray.push(buttonDurationName);
            evt.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
            localStorage.setItem('yqcs_duration.' + buttonDurationName, 'true');
            localbuttonDurationNameNumber++;
        }

        filter();

        if (localbuttonDurationNameNumber > 0) {
            durationLi.children[1].children[0].innerHTML = '<i class="fas fa-clock fa-lg"></i> Durées<span class="criticNumber">' + localbuttonDurationNameNumber + '</span>';
        } else {
            durationLi.children[1].children[0].innerHTML = '<i class="fas fa-clock fa-lg"></i> Durées<span class="criticNumber criticNumberZero">0</span>';
        }
    }

    // Set or unset active ratings on load
    function menuStarsOnLoad() {
        starsArray.forEach(function(stars) {
            stars.children[0].children[0].addEventListener('click', setLocalStorageStars.bind(this), false);

            var buttonStarsName = stars.children[0].children[0].parentNode.parentNode.classList[2].replace('datanumber', '');
            var localbuttonStarsName = localStorage.getItem('yqcs_stars.' + buttonStarsName);

            if (localbuttonStarsName == 'true' || localbuttonStarsName == null) {
                starsNumberBool = true;
                localbuttonStarsNameNumber++;
                if (localbuttonStarsName == null) {
                    localStorage.setItem('yqcs_stars.' + buttonStarsName, 'true');
                }

                filters.starsArray.push(buttonStarsName);

                filter();
            } else if (localbuttonStarsName == 'false') {
                stars.children[0].children[0].children[5].children[0].removeAttribute('checked');
            }
        });

        if (localbuttonStarsNameNumber > 0) {
            starsLi.children[1].children[0].innerHTML = '<i class="fas fa-star fa-lg"></i> Notes<span class="criticNumber">' + localbuttonStarsNameNumber + '</span>';
        } else {
            starsLi.children[1].children[0].innerHTML = '<i class="fas fa-star fa-lg"></i> Notes<span class="criticNumber criticNumberZero">0</span>';
        }

        if (starsNumberBool) {
            localStorage.setItem('yqcs_stars.' + 'mainToggleStars', 'true');
            starsInput.children[0].children[0].innerHTML = 'Tout désélectionner<span><input id="starsButton0" type="checkbox" checked="checked"><label for="starsButton0"></label></span>';
        } else {
            localStorage.setItem('yqcs_stars.' + 'mainToggleStars', 'false');
            starsInput.children[0].children[0].innerHTML = 'Tout sélectionner<span><input id="starsButton0" type="checkbox"><label for="starsButton0"></label></span>';
        }
    }

    // Set yqcs_localStorage for each ratings button
    function setLocalStorageStars(evt) {
        var buttonStarsName = evt.currentTarget.parentNode.parentNode.classList[2].replace('datanumber', '');
        var isActive = evt.currentTarget.children[5].children[0].getAttribute('checked');

        if (isActive == 'checked') {
            filters.starsArray.splice(filters.starsArray.indexOf(buttonStarsName), 1);
            evt.currentTarget.children[5].children[0].removeAttribute('checked');
            localStorage.setItem('yqcs_stars.' + buttonStarsName, 'false');
            localbuttonStarsNameNumber--;
        } else {
            filters.starsArray.push(buttonStarsName);
            evt.currentTarget.children[5].children[0].setAttribute('checked', 'checked');
            localStorage.setItem('yqcs_stars.' + buttonStarsName, 'true');
            localbuttonStarsNameNumber++;
        }

        filter();

        if (localbuttonStarsNameNumber > 0) {
            starsLi.children[1].children[0].innerHTML = '<i class="fas fa-star fa-lg"></i> Notes<span class="criticNumber">' + localbuttonStarsNameNumber + '</span>';
        } else {
            starsLi.children[1].children[0].innerHTML = '<i class="fas fa-star fa-lg"></i> Notes<span class="criticNumber criticNumberZero">0</span>';
        }
    }

    // Return params values
    function paramsURL(param) {
        return params.get(param);
    }

    // Check if URL has params
    function paramsURLCheck(param) {
        return params.has(param);
    }

    // Add ratings info details
    function ratingInfoDetails() {
        var tags = document.querySelectorAll('.picture-item__tags');
        var imgParent = document.querySelectorAll('.aspect--16x9');

        tags.forEach(function(tag) {
            tag.addEventListener('click', function() {
                tag.parentNode.parentNode.parentNode.children[0].children[0].children[2].classList.toggle('displayNone');
            }, false);
        });

        imgParent.forEach(function(tag) {
            tag.addEventListener('mouseenter', function() {
                if (tag.children[0].children[2].classList.contains('displayNone')) {
                    tag.children[0].children[3].classList.remove('displayNone');
                }
            }, false);
        });

        imgParent.forEach(function(tag) {
            tag.addEventListener('mouseleave', function() {
                if (tag.children[0].children[2].classList.contains('displayNone')) {
                    tag.children[0].children[3].classList.add('displayNone');
                }
            }, false);
        });
    }

    // Clear yqcs_localStorage on click trash icon
    function reset() {
        var trashIcon = document.querySelector('.fa-trash-alt');

        trashIcon.addEventListener('click', function() {
            Swal.fire({
                title: 'Êtes-vous sûr de vouloir remettre à zéro vos préférences ?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'var(--green-color)',
                cancelButtonColor: '#d33',
                confirmButtonText: '<i class="fas fa-thumbs-up"></i> OK',
                cancelButtonText: '<i class="fas fa-thumbs-down"></i> Annuler'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Vos préférences ont été remises à zéro !',
                        text: 'La page en cours va être rechargée...',
                        timer: 5000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        icon: 'success'
                    }).then((_result) => {
                        localStorage.clear();
                        window.location = 'https://yaquoicommeserie.fr';
                    });
                }
            });
        }, false);
    }

    // Focus search bar on CMD/CTRL + F keys
    function searchShortcut() {
        onkeydown = onkeyup = function(e) {
            if (e.ctrlKey == true && e.key == 'f' || e.metaKey == true && e.key == 'f') {
                e.preventDefault();
                if (e.ctrlKey == true && e.metaKey == true && e.key == 'f') return;
                document.getElementById('filters-search-input').focus();
            } else if (e.key == 'Escape') {
                e.preventDefault();
                document.getElementById('filters-search-input').blur();
                document.querySelector('#overlay').style.display = 'none';
                document.querySelector('iframe').src = '';
                document.body.style.overflow = 'scroll';
            }
        };
    }

    // Set or unset all critic buttons
    function setMenuButtonAll() {
        var criticButtonNumber = document.querySelectorAll('.nav-item.criticButton:not(.mainToggle)').length;
        var networkNumber = document.querySelectorAll('.nav-item.networkButton:not(.mainToggleNetwork)').length;
        var nationalityNumber = document.querySelectorAll('.nav-item.nationalityButton:not(.mainToggleNationality)').length;
        var durationNumber = document.querySelectorAll('.nav-item.durationButton:not(.mainToggleDuration)').length;
        var starsNumber = document.querySelectorAll('.nav-item.starsButton:not(.mainToggleStars)').length;

        criticToggle0.addEventListener('click', function() {
            localStorage.setItem('yqcs_menu.' + 'menuBool', true);

            criticArray.forEach(function(button) {
                var buttonCriticName = button.children[0].children[0].textContent;

                if (criticNumberBool) {
                    button.children[0].children[0].children[0].children[0].removeAttribute('checked');
                    localStorage.setItem('yqcs_critic.' + buttonCriticName, 'false');
                    localbuttonCriticNameNumber = 0;
                    criticLi.children[1].children[0].innerHTML = '<i class="fas fa-newspaper fa-lg"></i> Presse AlloCiné<span class="criticNumber criticNumberZero">0</span>';
                } else {
                    button.children[0].children[0].children[0].children[0].setAttribute('checked', 'checked');
                    localStorage.setItem('yqcs_critic.' + buttonCriticName, 'true');
                    localbuttonCriticNameNumber = criticButtonNumber;
                    criticLi.children[1].children[0].innerHTML = '<i class="fas fa-newspaper fa-lg"></i> Presse AlloCiné<span class="criticNumber">' + localbuttonCriticNameNumber + '</span>';
                }
            });

            if (criticNumberBool) {
                criticNumberBool = false;
            } else {
                criticNumberBool = true;
            }
        }, false);

        networkButton0.addEventListener('click', function() {
            networkArray.forEach(function(network) {
                var networkButtonName = network.children[0].children[0].textContent;

                if (networkNumberBool) {
                    network.children[0].children[0].children[0].children[0].removeAttribute('checked');
                    localStorage.setItem('yqcs_network.' + networkButtonName, 'false');
                    localbuttonNetworkNameNumber = 0;
                    networkLi.children[1].children[0].innerHTML = '<i class="fas fa-tv fa-lg"></i> Plateformes<span class="criticNumber criticNumberZero">0</span>';
                    filters.networkArray = ['No network'];
                } else {
                    network.children[0].children[0].children[0].children[0].setAttribute('checked', 'checked');
                    localStorage.setItem('yqcs_network.' + networkButtonName, 'true');
                    localbuttonNetworkNameNumber = networkNumber;
                    networkLi.children[1].children[0].innerHTML = '<i class="fas fa-tv fa-lg"></i> Plateformes<span class="criticNumber">' + localbuttonNetworkNameNumber + '</span>';
                    filters.networkArray.push(networkButtonName);
                }
            });

            filter();

            if (networkNumberBool) {
                networkNumberBool = false;
            } else {
                networkNumberBool = true;
            }
        }, false);

        nationalityButton0.addEventListener('click', function() {
            nationalityArray.forEach(function(nationality) {
                var nationalityButtonName = nationality.children[0].children[0].textContent;

                if (nationalityNumberBool) {
                    nationality.children[0].children[0].children[0].children[0].removeAttribute('checked');
                    localStorage.setItem('yqcs_nationality.' + nationalityButtonName, 'false');
                    localbuttonNationalityNameNumber = 0;
                    nationalityLi.children[1].children[0].innerHTML = '<i class="fas fa-flag fa-lg"></i> Nationalités<span class="criticNumber criticNumberZero">0</span>';
                    filters.nationalityArray = ['No nationality'];
                } else {
                    nationality.children[0].children[0].children[0].children[0].setAttribute('checked', 'checked');
                    localStorage.setItem('yqcs_nationality.' + nationalityButtonName, 'true');
                    localbuttonNationalityNameNumber = nationalityNumber;
                    nationalityLi.children[1].children[0].innerHTML = '<i class="fas fa-flag fa-lg"></i> Nationalités<span class="criticNumber">' + localbuttonNationalityNameNumber + '</span>';
                    filters.nationalityArray.push(nationalityButtonName);
                }
            });

            filter();

            if (nationalityNumberBool) {
                nationalityNumberBool = false;
            } else {
                nationalityNumberBool = true;
            }
        }, false);

        durationButton0.addEventListener('click', function() {
            durationArray.forEach(function(duration) {
                var durationButtonName = duration.children[0].children[0].textContent;

                if (durationNumberBool) {
                    duration.children[0].children[0].children[0].children[0].removeAttribute('checked');
                    localStorage.setItem('yqcs_duration.' + durationButtonName, 'false');
                    localbuttonDurationNameNumber = 0;
                    durationLi.children[1].children[0].innerHTML = '<i class="fas fa-clock fa-lg"></i> Durées<span class="criticNumber criticNumberZero">0</span>';
                    filters.durationArray = ['No duration'];
                } else {
                    duration.children[0].children[0].children[0].children[0].setAttribute('checked', 'checked');
                    localStorage.setItem('yqcs_duration.' + durationButtonName, 'true');
                    localbuttonDurationNameNumber = durationNumber;
                    durationLi.children[1].children[0].innerHTML = '<i class="fas fa-clock fa-lg"></i> Durées<span class="criticNumber">' + localbuttonDurationNameNumber + '</span>';
                    filters.durationArray.push(durationButtonName);
                }
            });

            filter();

            if (durationNumberBool) {
                durationNumberBool = false;
            } else {
                durationNumberBool = true;
            }
        }, false);

        starsButton0.addEventListener('click', function() {
            starsArray.forEach(function(stars) {
                var starsButtonName = stars.classList[2].replace('datanumber', '');

                if (starsNumberBool) {
                    stars.children[0].children[0].children[5].children[0].removeAttribute('checked');
                    localStorage.setItem('yqcs_stars.' + starsButtonName, 'false');
                    localbuttonStarsNameNumber = 0;
                    starsLi.children[1].children[0].innerHTML = '<i class="fas fa-star fa-lg"></i> Notes<span class="criticNumber criticNumberZero">0</span>';
                    filters.starsArray = ['No stars'];
                } else {
                    stars.children[0].children[0].children[5].children[0].setAttribute('checked', 'checked');
                    localStorage.setItem('yqcs_stars.' + starsButtonName, 'true');
                    localbuttonStarsNameNumber = starsNumber;
                    starsLi.children[1].children[0].innerHTML = '<i class="fas fa-star fa-lg"></i> Notes<span class="criticNumber">' + localbuttonStarsNameNumber + '</span>';
                    filters.starsArray.push(starsButtonName);
                }
            });

            filter();

            if (starsNumberBool) {
                starsNumberBool = false;
            } else {
                starsNumberBool = true;
            }
        }, false);
    }

    // Typewriter function
    function typewriter() {
        var app = document.getElementById('typewriter'),
            typewriter = new Typewriter(app, {
                loop: !0,
                delay: 50
            });
        typewriter.typeString('"T\'as vu quoi comme bonne série récemment ?"').pauseFor(2500).deleteAll().typeString('"C\'est quoi LA série à ne pas manquer ?"').pauseFor(2500).deleteAll().typeString('"Tu regardes quoi en ce moment ?"').pauseFor(2500).start();
    }
};

// Load ratings menu and ShuffleJS grid
document.addEventListener('DOMContentLoaded', function() {
    var Nav = new hcOffcanvasNav('#main-nav', {
        customToggle: '.fa-bars',
        width: 290,
        closeOnClick: false,
        levelSpacing: 0,
        navTitle: 'Préférences',
        labelBack: 'Retour',
        ariaLabels: {
            open: 'Ouvrir menu',
            close: 'Fermer menu',
            submenu: 'Sous-menu'
        }
    });

    Nav.on('close', function() {
        var menuBool = localStorage.getItem('yqcs_menu.' + 'menuBool');

        if (menuBool == 'true') {
            document.location.reload();
            menuBool = localStorage.setItem('yqcs_menu.' + 'menuBool', false);
        }
    });

    window.main = new DOMLoaded(document.getElementById('grid'));
});