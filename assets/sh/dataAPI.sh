SECONDS=0

echo "[" > ./assets/js/dataAPI.json
    id=1
    seriesNumber=$(wc -l assets/sh/seriesIds.txt | awk '{print $1}')

    seriesIdsFile="./assets/sh/seriesIds.txt"
    while IFS= read -r seriesIdsLine <&3; do
    echo $id sur $seriesNumber
    echo "{" >> ./assets/js/dataAPI.json
        allocineEndingUrl=$(echo $seriesIdsLine | cut -d',' -f1)
        curl -s https://www.allocine.fr$allocineEndingUrl > allocineTemp

        title=$(cat allocineTemp | grep -m1 "<meta property=\"og:title\" content=\"" | cut -d'"' -f4 | sed 's/&#039;/'"'"'/' | sed 's/[[:blank:]]*$//')
        echo "\"title\": \"$title\"," >> ./assets/js/dataAPI.json

        echo "\"platforms\": {" >> ./assets/js/dataAPI.json
            echo "\"allocine\": {" >> ./assets/js/dataAPI.json
                allocineId=$(echo $allocineEndingUrl | sed 's/\/series\/ficheserie_gen_cserie=//' | sed 's/.html//')
                echo "\"id\": \"$allocineId\"," >> ./assets/js/dataAPI.json

                allocineUrl="https://www.allocine.fr$allocineEndingUrl"
                echo "\"url\": \"$allocineUrl\"," >> ./assets/js/dataAPI.json

                allocineCriticsRating=$(cat allocineTemp | grep -Eo "<span class=\"stareval-note\">[0-9],[0-9]</span><span class=\"stareval-review light\"> [0-9]+ critique*" | cut -d'>' -f2 | cut -d'<' -f1 | sed 's/,/./')
                if [[ ! -z $allocineCriticsRating ]]; then
                    echo "\"criticsRating\": \"$allocineCriticsRating\"," >> ./assets/js/dataAPI.json
                else
                    echo "\"criticsRating\": null," >> ./assets/js/dataAPI.json
                fi

                curl -s https://www.allocine.fr/series/ficheserie-$allocineId/critiques/presse/ > allocineTemp2
                allocineCriticsNumber=$(cat allocineTemp2 | grep "js-anchor-link\">" | wc -l | awk '{print $1}')
                if [[ $allocineCriticsNumber -gt 0 ]]; then
                    echo "\"criticsRatingDetails\":{" >> ./assets/js/dataAPI.json
                    criticNumber=0
                    dataFile="./assets/sh/criticName.txt"
                    while IFS= read -r criticName <&3; do
                        criticName=$(echo $criticName | cut -d',' -f1)
                        criticNameFirst=$(echo $criticName | cut -d',' -f1)
                        criticRatingNumber=$(cat allocineTemp2 | grep "js-anchor-link\">$criticName<" | cut -d'"' -f6 | wc -l | awk '{print $1}')

                        if [[ $criticNameFirst != $criticNameTemp ]]; then
                        if [[ $criticRatingNumber -gt 0 ]]; then
                            for criticRatingNumberIndex in $( eval echo {1..$criticRatingNumber} )
                            do
                            criticRating=$(cat allocineTemp2 | grep -m$criticRatingNumberIndex "js-anchor-link\">$criticName<" | tail -1 | head -1 | cut -d'"' -f6)

                            if [[ $criticRatingNumberIndex -gt 1 ]]; then
                                criticNameTemp="$criticName"
                                criticName="$criticName$criticRatingNumberIndex"
                            fi

                            if [[ $criticName == "Pop Matters" ]]; then
                                criticName="PopMatters"
                            fi

                            case $criticRating in
                                "Chef-d&#039;oeuvre")
                                echo "\"$criticName\": \"5\"," >> ./assets/js/dataAPI.json
                                ;;
                                "Excellent")
                                echo "\"$criticName\": \"4.5\"," >> ./assets/js/dataAPI.json
                                ;;
                                "Tr&egrave;s bien")
                                echo "\"$criticName\": \"4\"," >> ./assets/js/dataAPI.json
                                ;;
                                "Bien")
                                echo "\"$criticName\": \"3.5\"," >> ./assets/js/dataAPI.json
                                ;;
                                "Pas mal")
                                echo "\"$criticName\": \"3\"," >> ./assets/js/dataAPI.json
                                ;;
                                "Moyen")
                                echo "\"$criticName\": \"2.5\"," >> ./assets/js/dataAPI.json
                                ;;
                                "Pas terrible")
                                echo "\"$criticName\": \"2\"," >> ./assets/js/dataAPI.json
                                ;;
                                "Mauvais")
                                echo "\"$criticName\": \"1.5\"," >> ./assets/js/dataAPI.json
                                ;;
                                "Tr&egrave;s mauvais")
                                echo "\"$criticName\": \"1\"," >> ./assets/js/dataAPI.json
                                ;;
                                "Nul")
                                echo "\"$criticName\": \"0.5\"," >> ./assets/js/dataAPI.json
                                ;;
                                *)
                                echo "\"$criticName\": \"\"," >> ./assets/js/dataAPI.json
                                ;;
                            esac

                            if [[ $criticRatingNumberIndex -gt 1 ]]; then
                                criticName="$criticNameTemp"
                            fi

                            criticNumber=$[$criticNumber+1]
                            done
                        fi
                        fi

                        criticNameTemp=$criticNameFirst
                    done 3<$dataFile
                    echo "}," >> ./assets/js/dataAPI.json
                else
                    echo "\"criticsRatingDetails\": null," >> ./assets/js/dataAPI.json
                fi

                allocineUsersRating=$(cat allocineTemp | grep -Eo "<span class=\"stareval-note\">[0-9],[0-9]</span><span class=\"stareval-review light\"> [0-9]+ note*" | cut -d'>' -f2 | cut -d'<' -f1 | sed 's/,/./')
                echo "\"usersRating\": \"$allocineUsersRating\"," >> ./assets/js/dataAPI.json
            echo "}," >> ./assets/js/dataAPI.json
            betaseriesEndingUrl=$(echo $seriesIdsLine | cut -d',' -f3)
            if [[ $betaseriesEndingUrl != "noBetaseriesId" ]]; then
                echo "\"betaseries\": {" >> ./assets/js/dataAPI.json
                    curl -s https://www.betaseries.com/serie/$betaseriesEndingUrl > betaseriesTemp

                    echo "\"id\": \"$betaseriesEndingUrl\"," >> ./assets/js/dataAPI.json

                    betaseriesUrl="https://www.betaseries.com/serie/$betaseriesEndingUrl"
                    echo "\"url\": \"$betaseriesUrl\"," >> ./assets/js/dataAPI.json

                    betaseriesUsersRating=$(cat betaseriesTemp | grep "stars js-render-stars" | cut -d'"' -f4 | cut -d' ' -f1 | sed 's/,/./')
                    echo "\"usersRating\": \"$betaseriesUsersRating\"," >> ./assets/js/dataAPI.json
                echo "}," >> ./assets/js/dataAPI.json
            else
                echo "\"betaseries\": null," >> ./assets/js/dataAPI.json
            fi
            imdbEndingUrl=$(echo $seriesIdsLine | cut -d',' -f2)
            if [[ $imdbEndingUrl != "noImdbId" ]]; then
                echo "\"imdb\": {" >> ./assets/js/dataAPI.json
                    curl -s https://www.imdb.com/title/$imdbEndingUrl/ > imdbTemp

                    echo "\"id\": \"$imdbEndingUrl\"," >> ./assets/js/dataAPI.json

                    imdbUrl="https://www.imdb.com/title/$imdbEndingUrl"
                    echo "\"url\": \"$imdbUrl\"," >> ./assets/js/dataAPI.json

                    imdbUsersRating=$(cat imdbTemp | grep -m1 "ratingValue" | cut -d'"' -f4)
                    echo "\"usersRating\": \"$imdbUsersRating\"," >> ./assets/js/dataAPI.json
                echo "}," >> ./assets/js/dataAPI.json
            else
                echo "\"imdb\": null," >> ./assets/js/dataAPI.json
            fi
            senscritiqueEndingUrl=$(echo $seriesIdsLine | cut -d',' -f4)
            if [[ $senscritiqueEndingUrl != "noSenscritiqueId" ]]; then
                echo "\"senscritique\": {" >> ./assets/js/dataAPI.json
                    curl -s https://www.senscritique.com/serie/$senscritiqueEndingUrl > senscritiqueTemp

                    echo "\"id\": \"$senscritiqueEndingUrl\"," >> ./assets/js/dataAPI.json

                    senscritiqueUrl="https://www.senscritique.com/serie/$senscritiqueEndingUrl"
                    echo "\"url\": \"$senscritiqueUrl\"," >> ./assets/js/dataAPI.json

                    senscritiqueUsersRating=$(cat senscritiqueTemp | grep "pvi-scrating-value" | cut -d'>' -f2 | cut -d'<' -f1)
                    echo "\"usersRating\": \"$senscritiqueUsersRating\"," >> ./assets/js/dataAPI.json
                echo "}" >> ./assets/js/dataAPI.json
            else
                echo "\"senscritique\": null" >> ./assets/js/dataAPI.json
            fi
        echo "}" >> ./assets/js/dataAPI.json
    echo "}," >> ./assets/js/dataAPI.json
    id=$[$id+1]
    done 3<$seriesIdsFile
echo "]" >> ./assets/js/dataAPI.json

cat ./assets/js/dataAPI.json \
| tr '\n' ' ' \
| sed 's/, },/},/g' \
| sed 's/, } } }/} } }/g' \
| sed 's/} } }, ]/} } } ]/g '> temp
cat temp > ./assets/js/dataAPI.json

rm -f allocineTemp
rm -f allocineTemp2
rm -f betaseriesTemp
rm -f imdbTemp
rm -f senscritiqueTemp

dataDuration=$SECONDS
echo "Complete in $(($dataDuration / 60)) minutes and $(($dataDuration % 60)) seconds ✅"