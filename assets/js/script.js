var DOMLoaded = function() {
    var Shuffle = window.Shuffle;
    var shuffleInstance;

    var genreArray = Array.from(document.querySelectorAll('.filter-options button'));
    var periodArray = Array.from(document.querySelectorAll('.period-options option'));
    var criticArray = Array.from(document.querySelectorAll('.nav-item.criticButton:not(.mainToggle)'));
    var networkArray = Array.from(document.querySelectorAll('.nav-item.networkButton:not(.mainToggleNetwork)'));
    var nationalityArray = Array.from(document.querySelectorAll('.nav-item.nationalityButton:not(.mainToggleNationality)'));
    var durationArray = Array.from(document.querySelectorAll('.nav-item.durationButton:not(.mainToggleDuration)'));

    var gridContainerElement = document.querySelector('#grid');

    var criticInput = document.querySelector('.nav-item.criticAllocine');
    var networkInput = document.querySelector('.nav-item.mainToggleNetwork');
    var nationalityInput = document.querySelector('.nav-item.mainToggleNationality');
    var durationInput = document.querySelector('.nav-item.mainToggleDuration');

    var criticToggle0 = document.querySelector('#criticToggle0').parentNode.parentNode;
    var networkButton0 = document.querySelector('#networkButton0').parentNode.parentNode;
    var nationalityButton0 = document.querySelector('#nationalityButton0').parentNode.parentNode;
    var durationButton0 = document.querySelector('#durationButton0').parentNode.parentNode;

    var userRatingLi = document.querySelector('.nav-item.userRating');
    var imdbUserRatingLi = document.querySelector('.nav-item.imdbUserRating');
    var periodOption = document.querySelector('.period-options');
    var criticLi = document.querySelector('.criticRatings');
    var networkLi = document.querySelector('.networkPreferences');
    var nationalityLi = document.querySelector('.nationalityPreferences');
    var durationLi = document.querySelector('.durationPreferences');

    var tglDarkmode = document.querySelector('.tgl-darkmode');

    var criticNull = false;

    var criticNumberBool = false;
    var networkNumberBool = false;
    var nationalityNumberBool = false;
    var durationNumberBool = false;

    var localbuttonCriticNameNumber = 0;
    var localbuttonNetworkNameNumber = 0;
    var localbuttonNationalityNameNumber = 0;
    var localbuttonDurationNameNumber = 0;

    const options = {
        time: '0.5s',
        mixColor: '#FFFFFF',
        backgroundColor: '#EDEDED'
    };

    const darkmode = new Darkmode(options);

    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);

    localStorage.setItem('menuBool', false);

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
                durationArray: ['No duration']
            };

            var mode = localStorage.getItem('mode');
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
            focusSearchInput();
            getDarkmodeStatus();
            getTglButtons();
            menuButtonsChecked();
            menuNetworkOnLoad();
            menuNationalityOnLoad();
            menuDurationOnLoad();
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
            var localbuttonCriticName = localStorage.getItem(buttonCriticName);

            if (localbuttonCriticName == 'true' || localbuttonCriticName == null) {
                criticNumberBool = true;
                localbuttonCriticNameNumber++;
                if (localbuttonCriticName == null) {
                    localStorage.setItem(buttonCriticName, 'true');
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
            localStorage.setItem('criticAllocine', 'true');
            criticInput.children[0].children[0].innerHTML = 'Tout désélectionner<span><input id="criticToggle0" type="checkbox" checked="checked"><label for="criticToggle0"></label></span>';
        } else {
            localStorage.setItem('criticAllocine', 'false');
            criticInput.children[0].children[0].innerHTML = 'Tout sélectionner<span><input id="criticToggle0" type="checkbox"><label for="criticToggle0"></label></span>';
        }
    }

    // Set localStorage for each critics button
    function setLocalStorageCritics(item) {
        localStorage.setItem('menuBool', true);

        var buttonCriticName = item.currentTarget.innerText;
        var localbuttonCriticName = localStorage.getItem(buttonCriticName);

        if (localbuttonCriticName == 'true') {
            item.currentTarget.children[0].children[0].removeAttribute('checked');
            localStorage.setItem(buttonCriticName, 'false');
            localbuttonCriticNameNumber--;
        } else {
            item.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
            localStorage.setItem(buttonCriticName, 'true');
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
        var titleTemp = dataForSingleItem.allocineData.title,
            picture = dataForSingleItem.allocineData.picture,
            status = dataForSingleItem.allocineData.status,
            url = dataForSingleItem.allocineData.url,
            date = dataForSingleItem.imdbData.date,
            duration = dataForSingleItem.imdbData.duration,
            criticFix = dataForSingleItem.allocineData.critic,
            criticNames = dataForSingleItem.allocineData.criticNames,
            user = dataForSingleItem.allocineData.user,
            imdbId = dataForSingleItem.imdbData.imdbId,
            imdbRating = dataForSingleItem.imdbData.imdbRating,
            divisionNumber = 0,
            genre, title, rating;

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

        if (dataForSingleItem.allocineData.network !== undefined) {
            if (dataForSingleItem.allocineData.network.id5 !== undefined) {
                network = dataForSingleItem.allocineData.network.id1 + ',' + dataForSingleItem.allocineData.network.id2 + ',' + dataForSingleItem.allocineData.network.id3 + ',' + dataForSingleItem.allocineData.network.id4 + ',' + dataForSingleItem.allocineData.network.id5;
            } else if (dataForSingleItem.allocineData.network.id4 !== undefined) {
                network = dataForSingleItem.allocineData.network.id1 + ',' + dataForSingleItem.allocineData.network.id2 + ',' + dataForSingleItem.allocineData.network.id3 + ',' + dataForSingleItem.allocineData.network.id4;
            } else if (dataForSingleItem.allocineData.network.id3 !== undefined) {
                network = dataForSingleItem.allocineData.network.id1 + ',' + dataForSingleItem.allocineData.network.id2 + ',' + dataForSingleItem.allocineData.network.id3;
            } else if (dataForSingleItem.allocineData.network.id2 !== undefined) {
                network = dataForSingleItem.allocineData.network.id1 + ',' + dataForSingleItem.allocineData.network.id2;
            } else if (dataForSingleItem.allocineData.network.id1 !== undefined) {
                network = dataForSingleItem.allocineData.network.id1;
            } else {
                network = 'Non renseignée';
            }
        } else {
            network = 'Non renseignée';
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
        today.setDate(today.getDate() - 7);
        var last7Days = ((today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear());
        var isDateIncludedlast7Days = dateCheck(last7Days, todayNew, dateFormatted);

        var today2 = new Date();
        var todayNewTemp2 = String(today2);
        var todayNew2 = splitDate(todayNewTemp2);
        today2.setDate(today2.getDate() - 14);
        var last14Days = ((today2.getMonth() + 1) + '/' + today2.getDate() + '/' + today2.getFullYear());
        var isDateIncludedlast14Days = dateCheck(last14Days, todayNew2, dateFormatted);

        var today3 = new Date();
        var todayNewTemp3 = String(today3);
        var todayNew3 = splitDate(todayNewTemp3);
        today3.setDate(today3.getDate() - 21);
        var last21Days = ((today3.getMonth() + 1) + '/' + today3.getDate() + '/' + today3.getFullYear());
        var isDateIncludedlast21Days = dateCheck(last21Days, todayNew3, dateFormatted);

        dateFormattedFilter = statusFilter(
            isDateIncludedlast7Days,
            isDateIncludedlast14Days,
            isDateIncludedlast21Days,
            status);

        critic = getActiveCritics(criticFix, criticNames);
        if (user == '') user = 0;
        if (imdbRating == '') imdbRating = 0;

        var criticActive = localStorage.getItem('criticAllocine');
        var userActive = localStorage.getItem('usersAllocine');
        var usersImdbActive = localStorage.getItem('usersImdb');
        var userInput = document.querySelector('.nav-item.usersAllocine');
        var userImdbInput = document.querySelector('.nav-item.usersImdb');

        if (retrieveLocalData(criticActive) && retrieveLocalData(userActive) && retrieveLocalData(usersImdbActive)) {
            divisionNumber = 3;

            if (critic == 0) {
                divisionNumber--;
                criticDetails = '/';
            } else {
                criticDetails = parseFloat(critic).toFixed(2).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1') + '<span>/5</span>';
            }

            if (user == 0) {
                divisionNumber--;
                userDetails = '/';
            } else {
                userDetails = user + '<span>/5</span>';
            }

            if (imdbRating == 0) {
                divisionNumber--;
                imdbDetails = '/';
            } else {
                imdbDetails = imdbRating + '<span>/10</span>';
            }

            ratingTemp = (parseFloat(critic) + parseFloat(user) + parseFloat(imdbRating / 2)) / divisionNumber;

            userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber">1</span>';
            imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber">1</span>';
        } else if (retrieveLocalData(criticActive) && retrieveLocalData(usersImdbActive)) {
            divisionNumber = 2;

            if (critic == 0) {
                divisionNumber--;
                criticDetails = '/';
            } else {
                criticDetails = parseFloat(critic).toFixed(2).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1') + '<span>/5</span>';
            }

            if (imdbRating == 0) {
                divisionNumber--;
                imdbDetails = '/';
            } else {
                imdbDetails = imdbRating + '<span>/10</span>';
            }

            ratingTemp = (parseFloat(critic) + parseFloat(imdbRating / 2)) / divisionNumber;

            userDetails = '/';

            userInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber criticNumberZero">0</span>';
            imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber">1</span>';
        } else if (retrieveLocalData(userActive) && retrieveLocalData(usersImdbActive)) {
            divisionNumber = 2;

            if (user == 0) {
                divisionNumber--;
                userDetails = '/';
            } else {
                userDetails = user + '<span>/5</span>';
            }

            if (imdbRating == 0) {
                divisionNumber--;
                imdbDetails = '/';
            } else {
                imdbDetails = imdbRating + '<span>/10</span>';
            }

            ratingTemp = (parseFloat(user) + parseFloat(imdbRating / 2)) / divisionNumber;

            criticDetails = '/';

            criticInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber">1</span>';
            imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber">1</span>';
        } else if (retrieveLocalData(criticActive) && retrieveLocalData(userActive)) {
            divisionNumber = 2;

            if (critic == 0) {
                divisionNumber--;
                criticDetails = '/';
            } else {
                criticDetails = parseFloat(critic).toFixed(2).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1') + '<span>/5</span>';
            }

            if (user == 0) {
                divisionNumber--;
                userDetails = '/';
            } else {
                userDetails = user + '<span>/5</span>';
            }

            ratingTemp = (parseFloat(critic) + parseFloat(user)) / divisionNumber;

            imdbDetails = '/';

            userImdbInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber">1</span>';
            imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber criticNumberZero">0</span>';
        } else if (retrieveLocalData(criticActive)) {
            divisionNumber = 1;

            if (critic == 0) {
                divisionNumber--;
                criticDetails = '/';
            } else {
                criticDetails = parseFloat(critic).toFixed(2).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1') + '<span>/5</span>';
            }

            ratingTemp = parseFloat(critic) / divisionNumber;

            userDetails = imdbDetails = '/';

            userInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userImdbInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber criticNumberZero">0</span>';
            imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber criticNumberZero">0</span>';
        } else if (retrieveLocalData(userActive)) {
            divisionNumber = 1;

            if (user == 0) {
                divisionNumber--;
                userDetails = '/';
            } else {
                userDetails = parseFloat(user).toFixed(2).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1') + '<span>/5</span>';
            }

            ratingTemp = parseFloat(user) / divisionNumber;

            criticDetails = imdbDetails = '/';

            criticInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userImdbInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber">1</span>';
            imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber criticNumberZero">0</span>';
        } else if (retrieveLocalData(usersImdbActive)) {
            divisionNumber = 1;

            if (imdbRating == 0) {
                divisionNumber--;
                imdbDetails = '/';
            } else {
                imdbDetails = parseFloat(imdbRating).toFixed(2).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1') + '<span>/10</span>';
            }

            ratingTemp = parseFloat(imdbRating / 2) / divisionNumber;

            criticDetails = userDetails = '/';

            criticInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber criticNumberZero">0</span>';
            imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber">1</span>';
        } else {
            ratingTemp = 0;

            criticDetails = userDetails = imdbDetails = '/';

            criticInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userImdbInput.children[0].children[0].children[0].children[0].removeAttribute('checked');
            userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber criticNumberZero">0</span>';
            imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber criticNumberZero">0</span>';
        }

        ratingTemp = ratingTemp || 0;
        ratingToFixed = ratingTemp.toFixed(2);
        rating = ratingToFixed.replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1') + '<span>/5</span>';

        if (titleTemp.length > 15) {
            title = titleTemp.substring(0, 14) + '...';
        } else {
            title = dataForSingleItem.allocineData.title;
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

        /* beautify ignore:start */
        return [
            '<figure class="col-3@xs col-4@sm col-3@md picture-item shuffle-item shuffle-item--visible" data-genre="' + genre + '" data-network="' + network + '" data-nationality="' + nationality + '" data-duration="' + duration + '" data-date-formatted="' + dateFormattedFilter + '" data-critic="' + ratingToFixed + '" data-date-created="' + dateFormatted + '" data-title="' + normalizeStr(title) + '" style="position: absolute; top: 0px; left: 0px; visibility: visible; will-change: transform; opacity: 1; transition-duration: 250ms; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-property: transform, opacity;">',
                '<div class="picture-item__inner">',
                    '<div class="aspect aspect--16x9">',
                        '<div class="aspect__inner">',
                            '<a href="' + url + '" target="_blank" rel="noopener" title="' + dataForSingleItem.allocineData.title + '">',
                                '<img src="' + picture + '" srcset="' + picture + '" alt="' + title + '">',
                            '</a>',
                            '<img class="picture-item__blur" src="' + picture + '" srcset="' + picture + '" alt="">',
                            '<div class="aspect__inner overlayInfos displayNone">',
                                criticDetailsUrl,
                                userDetailsUrl,
                                imdbDetailsUrl,
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
        isDateIncludedlast7Days,
        isDateIncludedlast14Days,
        isDateIncludedlast21Days,
        status) {
        var text = '',
            text2 = '';

        if (isDateIncludedlast7Days) {
            text = 'Les 7 derniers jours,Les 2 dernières semaines,Les 3 dernières semaines';
        } else if (isDateIncludedlast14Days) {
            text = 'Les 7 derniers jours,Les 2 dernières semaines';
        } else if (isDateIncludedlast21Days) {
            text = 'Les 3 dernières semaines';
        }

        if (status == 'En cours') {
            text2 = 'En cours';
        } else if (status == 'Terminée') {
            text2 = 'Terminée';
        } else if (status == 'À venir') {
            text2 = 'À venir';
        } else if (status == 'Annulée') {
            text2 = 'Annulée';
        }

        if (text == '') {
            return text2;
        } else if (text2 == '') {
            return text;
        } else {
            return text + ',' + text2;
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
                var localbuttonCriticName = localStorage.getItem(buttonCriticName);
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

    // Set localStorage for critic and user main buttons
    function retrieveLocalData(item) {
        if (item == 'true') {
            return true;
        } else if (item == 'false') {
            return false;
        } else {
            localStorage.setItem('criticAllocine', 'true');
            localStorage.setItem('usersAllocine', 'true');
            localStorage.setItem('usersImdb', 'true');
            return true;
        }
    }

    // Display retrieved data in grid div
    function appendMarkupToGrid(markup) {
        gridContainerElement.insertAdjacentHTML('beforeend', markup);
    }

    // Remove localStorage items
    function removeItems() {
        localStorage.removeItem('critic');
        localStorage.removeItem('title');
        localStorage.removeItem('dateCreated');
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

        function sortByDate(element) {
            return Date.parse(element.getAttribute('data-date-created'));
        }

        function sortByTitle(element) {
            return element.getAttribute('data-title').toLowerCase();
        }

        function sortCritic(element) {
            return element.getAttribute('data-critic');
        }

        if (value === 'date-created') {
            var dateCreated = localStorage.getItem('dateCreated');

            if (dateCreated === 'true') {
                options = {
                    reverse: false,
                    by: sortByDate,
                };

                evt.target.parentNode.innerHTML = '<input type="radio" name="sort-value" value="date-created"> Date de diffusion <i class="fas fa-arrow-up"></i>';
                localStorage.setItem('dateCreated', 'false');
            } else {
                options = {
                    reverse: true,
                    by: sortByDate,
                };

                evt.target.parentNode.innerHTML = '<input type="radio" name="sort-value" value="date-created"> Date de diffusion <i class="fas fa-arrow-down"></i>';
                localStorage.setItem('dateCreated', 'true');
            }
        } else if (value === 'title') {
            var title = localStorage.getItem('title');

            if (title === 'true') {
                options = {
                    reverse: true,
                    by: sortByTitle,
                };

                evt.target.parentNode.innerHTML = '<input type="radio" name="sort-value" value="title"> Titre <i class="fas fa-arrow-up"></i>';
                localStorage.setItem('title', 'false');
            } else {
                options = {
                    reverse: false,
                    by: sortByTitle,
                };

                evt.target.parentNode.innerHTML = '<input type="radio" name="sort-value" value="title"> Titre <i class="fas fa-arrow-down"></i>';
                localStorage.setItem('title', 'true');
            }
        } else if (value === 'critic') {
            var critic = localStorage.getItem('critic');

            if (critic === 'true') {
                options = {
                    reverse: false,
                    by: sortCritic,
                };

                evt.target.parentNode.innerHTML = '<input type="radio" name="sort-value" value="critic"> Note <i class="fas fa-arrow-up"></i>';
                localStorage.setItem('critic', 'false');
            } else {
                options = {
                    reverse: true,
                    by: sortCritic,
                };

                evt.target.parentNode.innerHTML = '<input type="radio" name="sort-value" value="critic"> Note <i class="fas fa-arrow-down"></i>';
                localStorage.setItem('critic', 'true');
            }
        }

        shuffleInstance.sort(options);
    }

    // Set active period filter
    function addPeriodFilter() {
        var activePeriod = normalizeStr(paramsURL('diffusion'));

        if (activePeriod == 'les_7_derniers_jours') {
            activePeriod = 'Les 7 derniers jours';
        } else if (activePeriod == 'les_2_dernieres_semaines') {
            activePeriod = 'Les 2 dernières semaines';
        } else if (activePeriod == 'les_3_dernieres_semaines') {
            activePeriod = 'Les 3 dernières semaines';
        } else if (activePeriod == 'en_cours') {
            activePeriod = 'En cours';
        } else if (activePeriod == 'terminee') {
            activePeriod = 'Terminée';
        } else if (activePeriod == 'a_venir') {
            activePeriod = 'À venir';
        } else if (activePeriod == 'annulee') {
            activePeriod = 'Annulée';
        } else {
            activePeriod = localStorage.getItem('activePeriod');
            if (activePeriod == null) {
                activePeriod = 'Les 7 derniers jours';
            }
        }

        setTimeout(function() {
            periodOption.value = activePeriod;
            periodOption.options[periodOption.selectedIndex].setAttribute('selected', 'selected');
            localStorage.setItem('activePeriod', activePeriod);
            handleOptionChange();
        }, 100);
    }

    // Get current option filters and filter
    function handleOptionChange() {
        filters.periodArray = getCurrentOptionFilters();

        if (filters.periodArray == 'Default') filters.periodArray = [];

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
            localStorage.setItem('activePeriod', activePeriod);
        });

        genreArray.forEach(function(button) {
            button.addEventListener('click', handleButtonChange.bind(this));
        }, false);
    }

    // Handle button change with additive and exclusive mode
    function handleButtonChange(evt) {
        var mode = localStorage.getItem('mode');

        if (mode == undefined) {
            localStorage.setItem('mode', 'exclusive');
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

        return true;
    }

    // Add additive/exclusive click listener
    function clickToggleMode() {
        var inputToggle = document.querySelector('#inputToggle');
        inputToggle.addEventListener('click', toggleMode, false);
    }

    // Set additive/exclusive toggle
    function toggleMode() {
        var mode = localStorage.getItem('mode');

        if (mode === 'additive') {
            localStorage.setItem('mode', 'exclusive');
        } else {
            localStorage.setItem('mode', 'additive');
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

    // Get darkmode status and set icon
    function getDarkmodeStatus() {
        var body = document.body;
        var darkmodeActive = localStorage.getItem('darkmode');

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
        var defaultInput = document.getElementById('defaultInput');
        defaultInput.click();
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
    }

    // Set localStorage toggles
    function toggleLocalData(item) {
        var classListName = item.currentTarget.parentNode.parentNode.classList[1];
        var classListNameActive = localStorage.getItem(classListName);

        if (classListName == 'criticAllocine' || classListName == 'usersAllocine' || classListName == 'usersImdb') {
            localStorage.setItem('menuBool', true);
        }

        if (classListNameActive == 'true') {
            if (classListName == 'criticAllocine') {
                item.currentTarget.innerHTML = 'Tout sélectionner<span><input id="criticToggle0" type="checkbox"><label for="criticToggle0"></label></span>';
            } else if (classListName == 'mainToggleNetwork') {
                item.currentTarget.innerHTML = 'Tout sélectionner<span><input id="networkButton0" type="checkbox"><label for="networkButton0"></label></span>';
            } else if (classListName == 'mainToggleNationality') {
                item.currentTarget.innerHTML = 'Tout sélectionner<span><input id="nationalityButton0" type="checkbox"><label for="nationalityButton0"></label></span>';
            } else if (classListName == 'mainToggleDuration') {
                item.currentTarget.innerHTML = 'Tout sélectionner<span><input id="durationButton0" type="checkbox"><label for="durationButton0"></label></span>';
            } else if (classListName == 'usersAllocine') {
                userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber criticNumberZero">0</span>';
            } else if (classListName == 'usersImdb') {
                imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber criticNumberZero">0</span>';
            }
            item.currentTarget.children[0].children[0].removeAttribute('checked');
            localStorage.setItem(classListName, 'false');
        } else {
            if (classListName == 'criticAllocine') {
                item.currentTarget.innerHTML = 'Tout désélectionner<span><input id="criticToggle0" type="checkbox"><label for="criticToggle0"></label></span>';
            } else if (classListName == 'mainToggleNetwork') {
                item.currentTarget.innerHTML = 'Tout désélectionner<span><input id="networkButton0" type="checkbox"><label for="networkButton0"></label></span>';
            } else if (classListName == 'mainToggleNationality') {
                item.currentTarget.innerHTML = 'Tout désélectionner<span><input id="nationalityButton0" type="checkbox"><label for="nationalityButton0"></label></span>';
            } else if (classListName == 'mainToggleDuration') {
                item.currentTarget.innerHTML = 'Tout désélectionner<span><input id="durationButton0" type="checkbox"><label for="durationButton0"></label></span>';
            } else if (classListName == 'usersAllocine') {
                userRatingLi.children[1].children[0].innerHTML = '<i class="fas fa-users fa-lg"></i> Spectateurs AlloCiné<span class="criticNumber">1</span>';
            } else if (classListName == 'usersImdb') {
                imdbUserRatingLi.children[1].children[0].innerHTML = '<i class="fab fa-imdb fa-lg"></i> Spectateurs IMDb<span class="criticNumber">1</span>';
            }
            item.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
            localStorage.setItem(classListName, 'true');
        }
    }

    // Move to top of ul checked critics
    function menuButtonsChecked() {
        var menuAllChecked = document.querySelectorAll('.nav-item.criticButton:not(.mainToggle)');
        var menuAllCheckedArray = Array.from(menuAllChecked);
        var i = 1;

        menuAllCheckedArray.forEach(function(button) {
            var buttonCriticName = button.children[0].children[0].textContent;
            var localbuttonCriticName = localStorage.getItem(buttonCriticName);

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
            var localbuttonNetworkName = localStorage.getItem(buttonNetworkName);

            if (localbuttonNetworkName == 'true' || localbuttonNetworkName == null) {
                networkNumberBool = true;
                localbuttonNetworkNameNumber++;
                if (localbuttonNetworkName == null) {
                    localStorage.setItem(buttonNetworkName, 'true');
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
            localStorage.setItem('mainToggleNetwork', 'true');
            networkInput.children[0].children[0].innerHTML = 'Tout désélectionner<span><input id="networkButton0" type="checkbox" checked="checked"><label for="networkButton0"></label></span>';
        } else {
            localStorage.setItem('mainToggleNetwork', 'false');
            networkInput.children[0].children[0].innerHTML = 'Tout sélectionner<span><input id="networkButton0" type="checkbox"><label for="networkButton0"></label></span>';
        }
    }

    // Set localStorage for each network button
    function setLocalStorageNetwork(evt) {
        var buttonNetworkName = evt.currentTarget.textContent;
        var isActive = evt.currentTarget.children[0].children[0].getAttribute('checked');

        if (isActive == 'checked') {
            filters.networkArray.splice(filters.networkArray.indexOf(buttonNetworkName), 1);
            evt.currentTarget.children[0].children[0].removeAttribute('checked');
            localStorage.setItem(buttonNetworkName, 'false');
            localbuttonNetworkNameNumber--;
        } else {
            filters.networkArray.push(buttonNetworkName);
            evt.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
            localStorage.setItem(buttonNetworkName, 'true');
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
            var localbuttonNationalityName = localStorage.getItem(buttonNationalityName);

            if (localbuttonNationalityName == 'true' || localbuttonNationalityName == null) {
                nationalityNumberBool = true;
                localbuttonNationalityNameNumber++;
                if (localbuttonNationalityName == null) {
                    localStorage.setItem(buttonNationalityName, 'true');
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
            localStorage.setItem('mainToggleNationality', 'true');
            nationalityInput.children[0].children[0].innerHTML = 'Tout désélectionner<span><input id="nationalityButton0" type="checkbox" checked="checked"><label for="nationalityButton0"></label></span>';
        } else {
            localStorage.setItem('mainToggleNationality', 'false');
            nationalityInput.children[0].children[0].innerHTML = 'Tout sélectionner<span><input id="nationalityButton0" type="checkbox"><label for="nationalityButton0"></label></span>';
        }
    }

    // Set localStorage for each nationality button
    function setLocalStorageNationality(evt) {
        var buttonNationalityName = evt.currentTarget.textContent;
        var isActive = evt.currentTarget.children[0].children[0].getAttribute('checked');

        if (isActive == 'checked') {
            filters.nationalityArray.splice(filters.nationalityArray.indexOf(buttonNationalityName), 1);
            evt.currentTarget.children[0].children[0].removeAttribute('checked');
            localStorage.setItem(buttonNationalityName, 'false');
            localbuttonNationalityNameNumber--;
        } else {
            filters.nationalityArray.push(buttonNationalityName);
            evt.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
            localStorage.setItem(buttonNationalityName, 'true');
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
            var localbuttonDurationName = localStorage.getItem(buttonDurationName);

            if (localbuttonDurationName == 'true' || localbuttonDurationName == null) {
                durationNumberBool = true;
                localbuttonDurationNameNumber++;
                if (localbuttonDurationName == null) {
                    localStorage.setItem(buttonDurationName, 'true');
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
            localStorage.setItem('mainToggleDuration', 'true');
            durationInput.children[0].children[0].innerHTML = 'Tout désélectionner<span><input id="durationButton0" type="checkbox" checked="checked"><label for="durationButton0"></label></span>';
        } else {
            localStorage.setItem('mainToggleDuration', 'false');
            durationInput.children[0].children[0].innerHTML = 'Tout sélectionner<span><input id="durationButton0" type="checkbox"><label for="durationButton0"></label></span>';
        }
    }

    // Set localStorage for each duration button
    function setLocalStorageDuration(evt) {
        var buttonDurationName = evt.currentTarget.textContent;
        var isActive = evt.currentTarget.children[0].children[0].getAttribute('checked');

        if (isActive == 'checked') {
            filters.durationArray.splice(filters.durationArray.indexOf(buttonDurationName), 1);
            evt.currentTarget.children[0].children[0].removeAttribute('checked');
            localStorage.setItem(buttonDurationName, 'false');
            localbuttonDurationNameNumber--;
        } else {
            filters.durationArray.push(buttonDurationName);
            evt.currentTarget.children[0].children[0].setAttribute('checked', 'checked');
            localStorage.setItem(buttonDurationName, 'true');
            localbuttonDurationNameNumber++;
        }

        filter();

        if (localbuttonDurationNameNumber > 0) {
            durationLi.children[1].children[0].innerHTML = '<i class="fas fa-clock fa-lg"></i> Durées<span class="criticNumber">' + localbuttonDurationNameNumber + '</span>';
        } else {
            durationLi.children[1].children[0].innerHTML = '<i class="fas fa-clock fa-lg"></i> Durées<span class="criticNumber criticNumberZero">0</span>';
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

        tags.forEach(function(tag) {
            tag.addEventListener('click', function() {
                tag.parentNode.parentNode.parentNode.children[0].children[0].children[2].classList.toggle('displayNone');
            }, false);
        });
    }

    function reset() {
        var trashIcon = document.querySelector('.fa-trash-alt');

        trashIcon.addEventListener('click', function() {
            Swal.fire({
                title: 'Êtes-vous sûr de vouloir remettre à zéro vos préférences ?',
                icon: 'warning',
                showCancelButton: true,
                cancelButtonText: 'Annuler',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Vos préférences ont été remises à zéro !',
                        text: 'La page en cours va être rechargée...',
                        timer: 5000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        icon: 'success'
                    });
                    localStorage.clear();
                    setTimeout(function() {
                        document.location.reload();
                    }, 5000);
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
            }
        };
    }

    // Set or unset all critic buttons
    function setMenuButtonAll() {
        var criticButtonNumber = document.querySelectorAll('.nav-item.criticButton:not(.mainToggle)').length;
        var networkNumber = document.querySelectorAll('.nav-item.networkButton:not(.mainToggleNetwork)').length;
        var nationalityNumber = document.querySelectorAll('.nav-item.nationalityButton:not(.mainToggleNationality)').length;
        var durationNumber = document.querySelectorAll('.nav-item.durationButton:not(.mainToggleDuration)').length;

        criticToggle0.addEventListener('click', function() {
            localStorage.setItem('menuBool', true);

            criticArray.forEach(function(button) {
                var buttonCriticName = button.children[0].children[0].textContent;

                if (criticNumberBool) {
                    button.children[0].children[0].children[0].children[0].removeAttribute('checked');
                    localStorage.setItem(buttonCriticName, 'false');
                    localbuttonCriticNameNumber = 0;
                    criticLi.children[1].children[0].innerHTML = '<i class="fas fa-newspaper fa-lg"></i> Presse AlloCiné<span class="criticNumber criticNumberZero">0</span>';
                } else {
                    button.children[0].children[0].children[0].children[0].setAttribute('checked', 'checked');
                    localStorage.setItem(buttonCriticName, 'true');
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
                    localStorage.setItem(networkButtonName, 'false');
                    localbuttonNetworkNameNumber = 0;
                    networkLi.children[1].children[0].innerHTML = '<i class="fas fa-tv fa-lg"></i> Plateformes<span class="criticNumber criticNumberZero">0</span>';
                    filters.networkArray = ['No network'];
                } else {
                    network.children[0].children[0].children[0].children[0].setAttribute('checked', 'checked');
                    localStorage.setItem(networkButtonName, 'true');
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
                    localStorage.setItem(nationalityButtonName, 'false');
                    localbuttonNationalityNameNumber = 0;
                    nationalityLi.children[1].children[0].innerHTML = '<i class="fas fa-flag fa-lg"></i> Nationalités<span class="criticNumber criticNumberZero">0</span>';
                    filters.nationalityArray = ['No nationality'];
                } else {
                    nationality.children[0].children[0].children[0].children[0].setAttribute('checked', 'checked');
                    localStorage.setItem(nationalityButtonName, 'true');
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
                    localStorage.setItem(durationButtonName, 'false');
                    localbuttonDurationNameNumber = 0;
                    durationLi.children[1].children[0].innerHTML = '<i class="fas fa-clock fa-lg"></i> Durées<span class="criticNumber criticNumberZero">0</span>';
                    filters.durationArray = ['No duration'];
                } else {
                    duration.children[0].children[0].children[0].children[0].setAttribute('checked', 'checked');
                    localStorage.setItem(durationButtonName, 'true');
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
        var menuBool = localStorage.getItem('menuBool');

        if (menuBool == 'true') {
            document.location.reload();
            menuBool = localStorage.setItem('menuBool', false);
        }
    });

    window.main = new DOMLoaded(document.getElementById('grid'));
});