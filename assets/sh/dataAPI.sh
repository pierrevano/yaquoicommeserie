SECONDS=0
echo "{\"tvshows\":[{" > ./assets/js/data.json
    seriesIdsFile="./assets/sh/seriesIds.txt"
    while IFS= read -r seriesIdsLine <&3; do
    allocineLineUrl=$(echo $seriesIdsLine | cut -d',' -f1)
    curl -s https://www.allocine.fr$allocineLineUrl > temp2

    title=$(cat temp2 | grep -m1 "<meta property=\"og:title\" content=\"" | cut -d'"' -f4 | sed 's/&#039;/'"'"'/' | sed 's/[[:blank:]]*$//')
    senscritiqueTitle=$title
    echo "\"title\": \"$title\"," >> ./assets/js/data.json

    echo "\"platforms\":[{"
        echo "\"allocine\":[{"
            id=$()
            echo "\"id\": \"$id\","
            echo "\"url\": \"$url\","
        echo "}]"
        echo "\"betaseries\":[{"
        echo "}]"
        echo "\"imdb\":[{"
        echo "}]"
        echo "\"senscritique\": [{"
        echo "}]"
    echo "}]"
    done 3<$seriesIdsFile
echo "}]}" >> ./assets/js/data.json
dataDuration=$SECONDS
echo "Complete in $(($dataDuration / 60)) minutes and $(($dataDuration % 60)) seconds ✅"