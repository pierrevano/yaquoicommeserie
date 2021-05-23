# Remove temp files function
remove_files () {
  # Delete temp file
  rm -f ./temp*
  rm -f ./assets/sh/criticNameBis.txt
  rm -f ./assets/sh/criticNameBisSorted.txt
  rm -f ./assets/sh/criticNameGenreButtonsTemp.txt
  rm -f ./assets/sh/criticNameNetworkButtonsTemp.txt
  rm -f ./assets/sh/criticNameNetworkButtonsTemp2.txt
  rm -f ./assets/sh/criticNameNationalityButtonsTemp.txt
  rm -f ./assets/sh/criticNameTemp.txt
  rm -f ./assets/sh/urlTemp.txt
  rm -f log
}

# Abord script function
abord_script () {
  # Download previous JSON
  curl -s https://yaquoicommeserie.fr/assets/js/data.json > ./assets/js/data.json

  remove_files

  echo "----------------------------------------------------------------------------------------------------"
  echo "abord script"

  # Exit script
  exit 1
}

remove_files

# Main variables
testing=$1
baseUrl=$2
if [[ -z $baseUrl ]]; then
  baseUrl=https://www.allocine.fr/series/top/
else
  baseUrl=https://www.allocine.fr/series-tv/
fi
seriesNumberIndexFirst=1
pagesNumberMin=1
pagesNumberMax=$3
if [[ -z $pagesNumberMax ]]; then
  pagesNumberMax=15
else
  pagesNumberMax=$3
fi
seriesNumberMax=15
checkMissingShows=$4
SECONDS=0

# Check before starting script
curl -s $baseUrl > temp
curl -s https://yaquoicommeserie.fr/assets/sh/checkingFile.txt > ./assets/sh/checkingFile.txt
firstSerie=$(cat temp | grep "/series/ficheserie_gen_cserie" | head -1 | head -1 | cut -d'>' -f2 | cut -d'<' -f1)
secondSerie=$(cat temp | grep "/series/ficheserie_gen_cserie" | head -2 | tail -1 | cut -d'>' -f2 | cut -d'<' -f1)
thirdSerie=$(cat temp | grep "/series/ficheserie_gen_cserie" | head -3 | tail -1 | cut -d'>' -f2 | cut -d'<' -f1)
fourthSerie=$(cat temp | grep "/series/ficheserie_gen_cserie" | head -4 | tail -1 | cut -d'>' -f2 | cut -d'<' -f1)
fifthSerie=$(cat temp | grep "/series/ficheserie_gen_cserie" | head -5 | tail -1 | cut -d'>' -f2 | cut -d'<' -f1)
firstSerieFromFile=$(cat ./assets/sh/checkingFile.txt | cut -d',' -f1)
if [[ ! -z $testing ]]; then
  firstSerieFromFile="testing"
fi
secondSerieFromFile=$(cat ./assets/sh/checkingFile.txt | cut -d',' -f2)
thirdSerieFromFile=$(cat ./assets/sh/checkingFile.txt | cut -d',' -f3)
fourthSerieFromFile=$(cat ./assets/sh/checkingFile.txt | cut -d',' -f4)
fifthSerieFromFile=$(cat ./assets/sh/checkingFile.txt | cut -d',' -f5)
if [[ $firstSerie != $firstSerieFromFile ]] || [[ $secondSerie != $secondSerieFromFile ]] || [[ $thirdSerie != $thirdSerieFromFile ]] || [[ $fourthSerie != $fourthSerieFromFile ]] || [[ $fifthSerie != $fifthSerieFromFile ]]; then
  echo $firstSerie,$secondSerie,$thirdSerie,$fourthSerie,$fifthSerie > ./assets/sh/checkingFile.txt
  echo "Data will be updated"
else
  curl -s https://yaquoicommeserie.fr/assets/js/data.json > ./assets/js/data.json
  rm -f ./temp*
  echo "Data is the same, script will exit now"
  exit 0
fi

# Remove lines with no data
sed -i '' "/noImdbId,noBetaseriesId,noSenscritiqueId/d" ./assets/sh/seriesIds.txt

echo "----------------------------------------------------------------------------------------------------"
betaseriesIdNotFoundNumber=$(cat assets/sh/seriesIds.txt | grep "[0-9],noBetaseriesId" | wc -l | awk '{print $1}')
echo "betaseriesIdNotFoundNumber: $betaseriesIdNotFoundNumber"
if [[ $betaseriesIdNotFoundNumber -ne 0 ]]; then
  for betaseriesIdNotFoundNumberIndex in $( eval echo {1..$betaseriesIdNotFoundNumber} )
  do
    imdbIdFound=$(cat assets/sh/seriesIds.txt | grep "[0-9],noBetaseriesId" | head -$betaseriesIdNotFoundNumberIndex | tail -1 | cut -d',' -f2)
    echo "imdbIdFound: $imdbIdFound"
    betaseriesCode=$(curl -s https://api.betaseries.com/shows/display\?key\=7f7fef35706f\&imdb_id\=$imdbIdFound | jq '.errors[0].code')
    if [[ $betaseriesCode != "4001" ]]; then
      echo "----------------------------------------------------------------------------------------------------"
      echo "betaseriesCode: $betaseriesCode"
      echo "imdbIdFound: $imdbIdFound"
      exit 0
    fi
  done
fi

echo "----------------------------------------------------------------------------------------------------"
imdbIdNotFoundNumber=$(cat assets/sh/seriesIds.txt | grep "noImdbId,[[:alnum:]]" | wc -l | awk '{print $1}')
echo "imdbIdNotFoundNumber: $imdbIdNotFoundNumber"
if [[ $imdbIdNotFoundNumber -ne 0 ]]; then
  for imdbIdNotFoundNumberIndex in $( eval echo {1..$imdbIdNotFoundNumber} )
  do
    betaseriesIdFound=$(cat assets/sh/seriesIds.txt | grep "noImdbId,[[:alnum:]]" | head -$imdbIdNotFoundNumberIndex | tail -1 | cut -d',' -f3)
    echo "betaseriesIdFound: $betaseriesIdFound"
    if [[ $betaseriesIdFound == film* ]]; then
      betaseriesIdFoundNew=$(echo $betaseriesIdFound | grep -Eo "[0-9]+")
      imdbRes=$(curl -s https://api.betaseries.com/movies/movie\?key\=7f7fef35706f\&id\=$betaseriesIdFoundNew | jq '.movie.imdb_id')
    else
      betaseriesIdFoundNew=$(echo $betaseriesIdFound | cut -d'/' -f2)
      imdbRes=$(curl -s https://api.betaseries.com/shows/display\?key\=7f7fef35706f\&url\=$betaseriesIdFoundNew | jq '.show.imdb_id')
    fi
    if [[ $imdbRes != "\"\"" ]]; then
      echo "----------------------------------------------------------------------------------------------------"
      echo "imdbRes: $imdbRes"
      echo "betaseriesIdFound: $betaseriesIdFound"
      exit 0
    fi
  done
fi

# Add criticName first list
cat ./assets/sh/criticName.txt | cut -d',' -f1 | sort | uniq >> ./assets/sh/criticNameTemp.txt

# Add first line to URLs check file
echo "first line" >> ./assets/sh/urlTemp.txt

# Add {"data":[{ at JSON beginning
echo "{\"data\":[{" > ./assets/js/data.json

# Get top series page
curl -s $baseUrl > temp

# Get AlloCiné baseUrl series number
seriesNumber=$(cat temp | grep "<a class=\"meta-title-link\" href=\"/series/ficheserie_gen_cserie=" | wc -l | awk '{print $1}')
if [[ $seriesNumber -gt 15 ]]; then
  seriesNumber=$seriesNumberMax
fi

if [[ $seriesNumber -lt 15 ]]; then
  # Define AlloCiné baseUrl pages number to 1
  pagesNumber=1
else
  # Define AlloCiné baseUrl pages number
  pagesNumber=$pagesNumberMax
fi

# Loop through all AlloCiné pages
for pagesNumberIndex in $( eval echo {$pagesNumberMin..$pagesNumber} )
do
  # Get AlloCiné first page
  if [[ $pagesNumberIndex -eq 1 ]]; then
    id=1
  # Get AlloCiné second until second to last page
  elif [[ $pagesNumberIndex -lt $pagesNumber ]]; then
    curl -s $baseUrl\?page\=$pagesNumberIndex > temp

    checkSeriesNumber=$(cat temp | grep "<a class=\"meta-title-link\" href=\"/series/ficheserie_gen_cserie=" | wc -l | awk '{print $1}')
    if [[ $checkSeriesNumber -eq 0 ]]; then
      curl -s $baseUrl\?page\=$pagesNumberIndex > temp
    fi
  # Get AlloCiné last page
  elif [[ $pagesNumberIndex -eq $pagesNumber ]]; then
    curl -s $baseUrl\?page\=$pagesNumberIndex > temp

    seriesNumber=$(cat temp | grep "<a class=\"meta-title-link\" href=\"/series/ficheserie_gen_cserie=" | wc -l | awk '{print $1}')
    if [[ $seriesNumber -gt 15 ]]; then
      seriesNumber=$seriesNumberMax
    fi
  fi

  seriesNumberIndex=$seriesNumberIndexFirst
  while [[ $seriesNumberIndex -le $seriesNumber ]]
  do
    # Add id
    echo "\"id\": \"$id\"," >> ./assets/js/data.json

    # Add AlloCiné data object
    echo "\"allocineData\":{" >> ./assets/js/data.json

    # Get AlloCiné serie url
    url=$(cat temp | grep -m$seriesNumberIndex "<a class=\"meta-title-link\" href=\"/series/ficheserie_gen_cserie=" | tail -1 | head -1 | cut -d'"' -f4)

    # Check if missing shows
    seriesIdsFile="./assets/sh/seriesIds.txt"
    while IFS= read -r seriesIdsLine <&3; do
      allocineLineUrl=$(echo $seriesIdsLine | cut -d',' -f1)

      if [[ $url == $allocineLineUrl ]]; then
        found=1
        break
      else
        found=0
      fi
    done 3<$seriesIdsFile

    if [[ $found -eq 0 ]]; then
      if [[ -z $testing ]]; then
        abord_script
      fi
    fi

    if [[ -z $checkMissingShows ]] || [[ $found -eq 0 ]]; then
      urlFile="./assets/sh/urlTemp.txt"
      while IFS= read -r urlTemp <&3; do
        if [[ $url == $urlTemp ]]; then
          duplicate=1
          break
        else
          duplicate=0
        fi
      done 3<$urlFile

      echo $url >> ./assets/sh/urlTemp.txt

      if [[ $duplicate -eq 0 ]]; then
        curl -s https://www.allocine.fr$url > temp2
        completeUrl=https://www.allocine.fr$url
        echo "\"url\": \"$completeUrl\"," >> ./assets/js/data.json

        # Get serie title
        title=$(cat temp2 | grep -m1 "<meta property=\"og:title\" content=\"" | cut -d'"' -f4 | sed 's/&#039;/'"'"'/' | sed 's/^[[:blank:]]*//;s/[[:blank:]]*$//')
        senscritiqueTitle=$title
        echo "\"title\": \"$title\"," >> ./assets/js/data.json

        # Get original title for IMDb
        originalTitle=$(cat temp2 | grep -A1 "Titre original" | tail -1 | cut -d'>' -f2 | cut -d'<' -f1 | sed 's/&#039;/'"'"'/' | sed 's/\&amp;/\&/g' | sed 's/^[[:blank:]]*//;s/[[:blank:]]*$//')
        originalTitleNumber=$(cat temp2 | grep -A1 "Titre original" | tail -1 | cut -d'>' -f2 | cut -d'<' -f1 | wc -l | awk '{print $1}')
        if [[ $originalTitleNumber -gt 0 ]]; then
          title=$originalTitle
        fi

        # Get serie creation date
        creationDate=$(cat temp2 | grep -A6 "meta-body-item meta-body-info" | grep -Eo "[0-9][0-9][0-9][0-9]" | head -1 | tail -1)
        echo "\"creationDate\": \"$creationDate\"," >> ./assets/js/data.json

        # Get serie duration
        duration=$(cat temp2 | grep -Eo "[0-9]+min" | grep -Eo "[0-9]+")
        echo "\"duration\": \"$duration\"," >> ./assets/js/data.json

        # Get serie picture
        picture=$(cat temp2 | grep -m1 "<meta property=\"og:image\" content=\"" | cut -d'"' -f4)
        echo "\"picture\": \"$picture\"," >> ./assets/js/data.json

        # Get serie id
        serieId=$(cat temp | grep -m$seriesNumberIndex "<a class=\"meta-title-link\" href=\"/series/ficheserie_gen_cserie=" | tail -1 | head -1 | cut -d'"' -f4 | cut -d'=' -f2 | cut -d'.' -f1)
        curl -s https://www.allocine.fr/series/ficheserie-$serieId/critiques/presse/ > temp3
        curl -s https://www.allocine.fr/series/ficheserie-$serieId/videos/ > temp4

        # Get serie trailer id
        serieTrailerId=$(cat temp4 | grep -m1 "<a class=\"meta-title-link\" href=\"/video/player_gen_cmedia=" | cut -d'=' -f4 | cut -d'&' -f1)
        echo "\"serieTrailerId\": \"$serieTrailerId\"," >> ./assets/js/data.json

        # Get all serie genres
        genreNumber=$(cat temp2 | grep -m3 "<span class=\"ACrL3NACrlcmllcy10di9n" | cut -d'>' -f2 | cut -d'<' -f1 | wc -l | awk '{print $1}')
        if [[ $genreNumber -gt 0 ]]; then
          echo "\"genre\":{" >> ./assets/js/data.json

          for genreNumberIndex in $( eval echo {1..$genreNumber} )
          do
            genreName=$(cat temp2 | grep -m3 "<span class=\"ACrL3NACrlcmllcy10di9n" | cut -d'>' -f2 | cut -d'<' -f1 | head -$genreNumberIndex | tail -1)
            echo "\"id$genreNumberIndex\": \"$genreName\"," >> ./assets/js/data.json
            echo $genreName >> ./assets/sh/criticNameGenreButtonsTemp.txt
          done

          echo "}," >> ./assets/js/data.json
        fi

        # Get all serie nationalities
        nationalityNumber=$(cat temp2 | grep " nationality" | wc -l | awk '{print $1}')
        if [[ $nationalityNumber -gt 0 ]]; then
          echo "\"nationality\":{" >> ./assets/js/data.json

          for nationalityNumberIndex in $( eval echo {1..$nationalityNumber} )
          do
            nationalityName=$(cat temp2 | grep " nationality" | head -$nationalityNumberIndex | tail -1 | cut -d'>' -f2 | cut -d'<' -f1 | sed 's/^[[:blank:]]*//;s/[[:blank:]]*$//')
            echo "\"id$nationalityNumberIndex\": \"$nationalityName\"," >> ./assets/js/data.json
            echo $nationalityName >> ./assets/sh/criticNameNationalityButtonsTemp.txt
          done

          echo "}," >> ./assets/js/data.json
        fi

        # Get all critic ratings
        echo "\"criticNames\":{" >> ./assets/js/data.json

        criticNumber=0
        dataFile="./assets/sh/criticName.txt"
        while IFS= read -r criticName <&3; do
          criticName=$(echo $criticName | cut -d',' -f1)
          criticNameFirst=$(echo $criticName | cut -d',' -f1)
          criticRatingNumber=$(cat temp3 | grep "js-anchor-link\">$criticName<" | cut -d'"' -f6 | wc -l | awk '{print $1}')

          if [[ $criticNameFirst != $criticNameTemp ]]; then
            if [[ $criticRatingNumber -gt 0 ]]; then
              for criticRatingNumberIndex in $( eval echo {1..$criticRatingNumber} )
              do
                criticRating=$(cat temp3 | grep -m$criticRatingNumberIndex "js-anchor-link\">$criticName<" | tail -1 | head -1 | cut -d'"' -f6)

                if [[ $criticRatingNumberIndex -gt 1 ]]; then
                  criticNameTemp="$criticName"
                  criticName="$criticName$criticRatingNumberIndex"
                fi

                if [[ $criticName == "Pop Matters" ]]; then
                  criticName="PopMatters"
                fi

                echo $criticName >> ./assets/sh/criticNameTemp.txt

                case $criticRating in
                  "Chef-d&#039;oeuvre")
                    echo "\"$criticName\": \"5\"," >> ./assets/js/data.json
                    ;;
                  "Excellent")
                    echo "\"$criticName\": \"4.5\"," >> ./assets/js/data.json
                    ;;
                  "Tr&egrave;s bien")
                    echo "\"$criticName\": \"4\"," >> ./assets/js/data.json
                    ;;
                  "Bien")
                    echo "\"$criticName\": \"3.5\"," >> ./assets/js/data.json
                    ;;
                  "Pas mal")
                    echo "\"$criticName\": \"3\"," >> ./assets/js/data.json
                    ;;
                  "Moyen")
                    echo "\"$criticName\": \"2.5\"," >> ./assets/js/data.json
                    ;;
                  "Pas terrible")
                    echo "\"$criticName\": \"2\"," >> ./assets/js/data.json
                    ;;
                  "Mauvais")
                    echo "\"$criticName\": \"1.5\"," >> ./assets/js/data.json
                    ;;
                  "Tr&egrave;s mauvais")
                    echo "\"$criticName\": \"1\"," >> ./assets/js/data.json
                    ;;
                  "Nul")
                    echo "\"$criticName\": \"0.5\"," >> ./assets/js/data.json
                    ;;
                  *)
                    echo "\"$criticName\": \"\"," >> ./assets/js/data.json
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

        echo "}," >> ./assets/js/data.json

        # Get critic number
        echo "\"criticNumber\": \"$criticNumber\"," >> ./assets/js/data.json

        # Get critic rating front page
        criticFrontPage=$(cat temp2 | grep -Eo "<span class=\"stareval-note\">[0-9],[0-9]</span><span class=\"stareval-review light\"> [0-9]+ critique*" | cut -d'>' -f2 | cut -d'<' -f1 | sed 's/,/./')
        echo "\"criticFrontPage\": \"$criticFrontPage\"," >> ./assets/js/data.json

        # Get critic rating back page
        critic=$(cat temp3 | grep -m1 -Eo "</div><span class=\"stareval-note\">[0-9],[0-9]</span></div>" | cut -d'>' -f3 | cut -d'<' -f1 | sed 's/,/./')
        criticZero=$(cat temp3 | grep -m1 -Eo "[0-9] titre de presse")
        if [[ $criticZero == "0 titre de presse" ]]; then
          critic=$criticFrontPage
        fi
        echo "\"critic\": \"$critic\"," >> ./assets/js/data.json

        # Get user rating number
        user=$(cat temp2 | grep -Eo "<span class=\"stareval-note\">[0-9],[0-9]</span><span class=\"stareval-review light\"> [0-9]+ note*" | cut -d'>' -f2 | cut -d'<' -f1 | sed 's/,/./')
        echo "\"user\": \"$user\"," >> ./assets/js/data.json

        curl -s https://www.allocine.fr/series/ficheserie-$serieId/saisons/ > temp10
        seasonsCriticNumber=$(cat temp10 | grep -A70 "/\">Saison " | grep -Eo "\"stareval-note\">[0-9],[0-9]" | cut -d'>' -f2 | sed 's/,/./g' | wc -l | awk '{print $1}')
        if [[ $seasonsCriticNumber -gt 1 ]]; then
          echo "\"seasonsCritic\":{" >> ./assets/js/data.json

          echo "\"seasonsCriticValue\":{" >> ./assets/js/data.json
          for seasonsCriticNumberIndex in $( eval echo {1..$seasonsCriticNumber} )
          do
            seasonsCritic=$(cat temp10 | grep -A70 "/\">Saison " | grep -Eo "\"stareval-note\">[0-9],[0-9]" | cut -d'>' -f2 | sed 's/,/./g' | tail -$seasonsCriticNumberIndex | head -1)
            echo "\"id$seasonsCriticNumberIndex\": \"$seasonsCritic\"," >> ./assets/js/data.json
          done
          echo "}," >> ./assets/js/data.json

          echo "\"seasonsCriticDetails\":{" >> ./assets/js/data.json
          for seasonsCriticNumberIndex in $( eval echo {1..$seasonsCriticNumber} )
          do
            seasonsCriticDetails=$(cat temp10 | grep -A70 "/\">Saison " | grep "\"stareval-review light\"" | sed 's/.*"stareval-review light">\(.*\)<\/span><\/div>/\1/' | sed 's/^[[:blank:]]*//;s/[[:blank:]]*$//' | tail -$seasonsCriticNumberIndex | head -1)
            echo "\"id$seasonsCriticNumberIndex\": \"$seasonsCriticDetails\"," >> ./assets/js/data.json
          done
          echo "}," >> ./assets/js/data.json

          echo "}," >> ./assets/js/data.json
        fi

        # Add ending bracket
        echo "}," >> ./assets/js/data.json

        # Add Senscritique object
        echo "\"senscritiqueData\":{" >> ./assets/js/data.json

        senscritiqueFile="./assets/sh/seriesIds.txt"
        while IFS= read -r senscritiqueLine <&3; do
          allocineLineUrl=$(echo $senscritiqueLine | cut -d',' -f1)

          if [[ $url == $allocineLineUrl ]]; then
            senscritiqueId=$(echo $senscritiqueLine | cut -d',' -f4)
            curl -s "https://www.senscritique.com/serie/$senscritiqueId" > temp11
            senscritiqueFound=1
            break
          else
            senscritiqueFound=0
          fi
        done 3<$senscritiqueFile

        if [[ $senscritiqueFound -eq 0 ]]; then
          senscritiqueTitleURLEncoded=$(echo $senscritiqueTitle | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/url_escape.sed)
          senscritiqueId=$(curl -s "https://www.senscritique.com/sc2/search/autocomplete.json?query=$senscritiqueTitleURLEncoded" \
          -H 'x-requested-with: XMLHttpRequest' | jq '.json | .[].url' | grep -m1 "/serie/" | sed 's/https:\/\/www.senscritique.com\/serie\///' | sed 's/\"//g')

          curl -s "https://www.senscritique.com/serie/$senscritiqueId" > temp11
          senscritiqueYear=$(cat temp11 | grep "pvi-product-year" | cut -d '(' -f2 | cut -d ')' -f1)

          if [[ $creationDate != $senscritiqueYear ]]; then
            senscritiqueId="noSenscritiqueId"

            echo "----------------------------------------------------------------------------------------------------"
            echo "senscritiqueId: $senscritiqueId"
          fi
        fi

        # Get SensCritique rating number
        senscritiqueRating=$(cat temp11 | grep "pvi-scrating-value" | cut -d'>' -f2 | cut -d'<' -f1)
        echo "\"senscritiqueRating\": \"$senscritiqueRating\"," >> ./assets/js/data.json

        # Add ending bracket
        echo "}," >> ./assets/js/data.json

        # Add Betaseries object
        echo "\"betaseriesData\":{" >> ./assets/js/data.json

        seriesIdsFile="./assets/sh/seriesIds.txt"
        while IFS= read -r seriesIdsLine <&3; do
          allocineLineUrl=$(echo $seriesIdsLine | cut -d',' -f1)

          if [[ $url == $allocineLineUrl ]]; then
            imdbId=$(echo $seriesIdsLine | cut -d',' -f2)
            curl -s https://www.imdb.com/title/$imdbId/ > temp6

            betaseriesTitle=$(echo $seriesIdsLine | cut -d',' -f3)
            if [[ $betaseriesTitle == film* ]]; then
              echo "\"betaseriesId\": \"$betaseriesTitle\"," >> ./assets/js/data.json
              curl -s https://www.betaseries.com/$betaseriesTitle > temp9
            else
              echo "\"betaseriesId\": \"serie/$betaseriesTitle\"," >> ./assets/js/data.json
              curl -s https://www.betaseries.com/serie/$betaseriesTitle > temp9
            fi
            betaseriesFound=1
            break
          else
            betaseriesFound=0
          fi
        done 3<$seriesIdsFile

        if [[ $betaseriesFound -eq 0 ]]; then
          echo "----------------------------------------------------------------------------------------------------"
          echo "serieId: $serieId"
          wikiData=0
          wikiUrl=$(curl -s https://query.wikidata.org/sparql\?query\=SELECT%20%3Fitem%20%3FitemLabel%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP1267%20%22$serieId%22.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%20%7D%0A%7D | grep "uri" | cut -d'>' -f2 | cut -d'<' -f1 | sed 's/http/https/' | sed 's/entity/wiki/')
          if [[ -z $wikiUrl ]]; then
            echo "wikiUrl: noWikiUrl"
            echo "senscritiqueTitleURLEncoded: $senscritiqueTitleURLEncoded"
            imdbId=$(curl -s https://www.imdb.com/find\?q\=$senscritiqueTitleURLEncoded\&s\=tt\&ttype\=tv | grep -m1 "<td class=\"primary_photo\">" | grep -Eo "tt[0-9]+" | head -1)
            echo "imdbId: $imdbId"
          else
            echo "wikiUrl: $wikiUrl"
            imdbId=$(curl -s $wikiUrl | grep "https://wikidata-externalid-url.toolforge.org/?p=345" | grep -Eo "tt[0-9]+" | head -1)
            echo "imdbId: $imdbId"
            wikiData=1
          fi

          if [[ -z $imdbId ]]; then
            echo "imdbId: noImdbId"
            imdbId="noImdbId"
          fi

          echo "wikiData: $wikiData"
          if [[ $wikiData -eq 0 ]]; then
            BetaseriesOriginalTitle=$(curl -s https://api.betaseries.com/shows/display\?key\=7f7fef35706f\&imdb_id\=$imdbId | jq '.show.original_title' | tr '[:upper:]' '[:lower:]' | sed 's/"//g')
            BetaseriesOriginalTitleYear=$(echo $BetaseriesOriginalTitle | grep " ([0-9][0-9][0-9][0-9])" | grep -Eo "[0-9]+")
            BetaseriesOriginalTitleLang=$(echo $BetaseriesOriginalTitle | grep " (fr)" | grep -Eo "fr")
            if [[ ! -z $BetaseriesOriginalTitleYear ]] || [[ ! -z $BetaseriesOriginalTitleLang ]]; then
              if [[ -z $BetaseriesOriginalTitleYear ]]; then
                BetaseriesOriginalTitleYear=$(curl -s https://api.betaseries.com/shows/display\?key\=7f7fef35706f\&imdb_id\=$imdbId | jq '.show.creation' | sed 's/"//g')
              fi
              echo "----------------------------------------------------------------------------------------------------"
              echo "BetaseriesOriginalTitleYear: $BetaseriesOriginalTitleYear"
              echo "BetaseriesOriginalTitleYear: $BetaseriesOriginalTitleYear" >> log
              if [[ ! -z $BetaseriesOriginalTitleLang ]]; then
                echo "BetaseriesOriginalTitleLang: $BetaseriesOriginalTitleLang"
                echo "BetaseriesOriginalTitleLang: $BetaseriesOriginalTitleLang" >> log
              fi
              if [[ $BetaseriesOriginalTitleYear != $creationDate ]]; then
                imdbId=$(curl -s https://www.imdb.com/find\?q\=$senscritiqueTitleURLEncoded\&s\=tt\&ttype\=tv | grep -m1 "<td class=\"primary_photo\">" | grep -Eo "tt[0-9]+" | head -3 | tail -1)
                BetaseriesOriginalTitle=$(curl -s https://api.betaseries.com/shows/display\?key\=7f7fef35706f\&imdb_id\=$imdbId | jq '.show.original_title' | tr '[:upper:]' '[:lower:]' | sed 's/"//g')
                BetaseriesOriginalTitleYear=$(curl -s https://api.betaseries.com/shows/display\?key\=7f7fef35706f\&imdb_id\=$imdbId | jq '.show.creation' | sed 's/"//g')
                echo "BetaseriesOriginalTitleYear: $BetaseriesOriginalTitleYear"
                echo "BetaseriesOriginalTitleYear: $BetaseriesOriginalTitleYear" >> log
                if [[ $BetaseriesOriginalTitleYear != $creationDate ]]; then
                  echo "creationDate: $creationDate"
                  echo "creationDate: $creationDate" >> log
                  imdbId="noImdbId"
                fi
              fi
              BetaseriesOriginalTitleNew=$(echo $BetaseriesOriginalTitle | sed 's/ ([0-9][0-9][0-9][0-9])//' | sed 's/ (fr)//')
              titleLower=$(echo $title | tr '[:upper:]' '[:lower:]' | sed 's/ ([0-9][0-9][0-9][0-9])//' | sed 's/ (fr)//')
              echo "BetaseriesOriginalTitleNew: $BetaseriesOriginalTitleNew"
              echo "titleLower: $titleLower"
              echo "BetaseriesOriginalTitleNew: $BetaseriesOriginalTitleNew" >> log
              echo "titleLower: $titleLower" >> log
            else
              BetaseriesOriginalTitleNew=$BetaseriesOriginalTitle
              titleLower=$(echo $title | tr '[:upper:]' '[:lower:]')
              echo "BetaseriesOriginalTitleNew: $BetaseriesOriginalTitleNew"
              echo "titleLower: $titleLower"
              echo "BetaseriesOriginalTitleNew: $BetaseriesOriginalTitleNew" >> log
              echo "titleLower: $titleLower" >> log
            fi

            if [[ $BetaseriesOriginalTitleNew != $titleLower ]]; then
              echo "BetaseriesOriginalTitleNew: $BetaseriesOriginalTitleNew"
              echo "titleLower: $titleLower"
              echo "BetaseriesOriginalTitleNew: $BetaseriesOriginalTitleNew" >> log
              echo "titleLower: $titleLower" >> log
              imdbId="noImdbId"
            fi
          fi

          betaseriesId="noBetaseriesId"
          betaseriesResourceUrl="noBetaseriesURL"
          if [[ $imdbId != "noImdbId" ]]; then
            betaseriesId=$(curl -s https://api.betaseries.com/shows/display\?key\=7f7fef35706f\&imdb_id\=$imdbId | jq '.show.resource_url' | cut -d'/' -f5 | sed 's/"//g')
            betaseriesResourceUrl=$(curl -s https://api.betaseries.com/shows/display\?key\=7f7fef35706f\&imdb_id\=$imdbId | jq '.show.resource_url' | sed 's/"//g')
            imdbIdCheck=$(curl -s https://api.betaseries.com/shows/display\?key\=7f7fef35706f\&url\=$betaseriesId | jq '.show.imdb_id' | sed 's/"//g')
            if [[ $imdbId != $imdbIdCheck ]]; then
              echo "----------------------------------------------------------------------------------------------------"
              echo "imdbId: $imdbId"
              echo "imdbIdCheck: $imdbIdCheck"
              imdbId="noImdbId"
              betaseriesId="noBetaseriesId"
              betaseriesResourceUrl="noBetaseriesURL"
            fi
          fi

          curl -s https://www.imdb.com/title/$imdbId/ > temp6
          curl -s $betaseriesResourceUrl > temp9

          echo "$url,$imdbId,$betaseriesId,$senscritiqueId" >> assets/sh/seriesIds.txt
        fi

        echo "----------------------------------------------------------------------------------------------------"
        echo "page: $pagesNumberIndex/$pagesNumber - show: $seriesNumberIndex/$seriesNumber - title: $title - serieId: $serieId ✅"

        # Get serie network
        networkNumber=$(cat temp9 | grep "https://www.betaseries.com/link" | wc -l | awk '{print $1}')
        if [[ $networkNumber -gt 0 ]]; then
          echo "\"network\":{" >> ./assets/js/data.json

          for networkNumberIndex in $( eval echo {1..$networkNumber} )
          do
            networkName=$(cat temp9 | grep -A1 "https://www.betaseries.com/link" | grep "alt" | cut -d'"' -f4 | head -$networkNumberIndex | tail -1)
            if [[ -z $networkName ]]; then
              networkName=$(cat temp9 | grep "https://www.betaseries.com/link" | cut -d'>' -f2 | cut -d'<' -f1 | head -$networkNumberIndex | tail -1)
              echo $networkName >> ./assets/sh/criticNameNetworkButtonsTemp2.txt
            else
              echo $networkName >> ./assets/sh/criticNameNetworkButtonsTemp.txt
            fi
            echo "\"id$networkNumberIndex\": \"$networkName\"," >> ./assets/js/data.json
          done

          echo "}," >> ./assets/js/data.json
        else
          networkNumber=$(cat temp2 | grep "<span class=\"info-holder-provider\">" | cut -d'>' -f2 | cut -d'<' -f1 | wc -l | awk '{print $1}')
          if [[ $networkNumber -eq 0 ]]; then
            curl -s https://www.allocine.fr/series/ficheserie-$serieId/diffusion-tv/ > temp9
            networkNumber=$(cat temp9 | grep "channel-logo\"" | head -1 | cut -d'"' -f6 | wc -l | awk '{print $1}')
            if [[ $networkNumber -gt 0 ]]; then
              networkName=$(cat temp9 | grep "channel-logo\"" | head -1 | cut -d'"' -f6)

              echo "\"network\":{" >> ./assets/js/data.json

              echo "\"id1\": \"$networkName\"," >> ./assets/js/data.json
              echo $networkName >> ./assets/sh/criticNameNetworkButtonsTemp2.txt

              echo "}," >> ./assets/js/data.json
            fi
          elif [[ $networkNumber -gt 0 ]]; then
            echo "\"network\":{" >> ./assets/js/data.json

            networkName=$(cat temp2 | grep "<span class=\"info-holder-provider\">" | head -1 | cut -d'>' -f2 | cut -d'<' -f1 | sed 's/^[[:blank:]]*//;s/[[:blank:]]*$//')
            echo "\"id1\": \"$networkName\"," >> ./assets/js/data.json
            echo $networkName >> ./assets/sh/criticNameNetworkButtonsTemp.txt

            echo "}," >> ./assets/js/data.json
          fi
        fi

        # Get serie network url
        networkUrlNumber=$(cat temp9 | grep "https://www.betaseries.com/link" | wc -l | awk '{print $1}')
        if [[ $networkUrlNumber -gt 0 ]]; then
          echo "\"networkUrl\":{" >> ./assets/js/data.json

          for networkUrlNumberIndex in $( eval echo {1..$networkUrlNumber} )
          do
            networkUrl=$(cat temp9 | grep "https://www.betaseries.com/link" | cut -d'"' -f2 | head -$networkUrlNumberIndex | tail -1)
            echo "\"id$networkUrlNumberIndex\": \"$networkUrl\"," >> ./assets/js/data.json
          done

          echo "}," >> ./assets/js/data.json
        else
          networkNumber=$(cat temp2 | grep "<span class=\"info-holder-provider\">" | cut -d'>' -f2 | cut -d'<' -f1 | wc -l | awk '{print $1}')
          if [[ $networkNumber -eq 0 ]]; then
            curl -s https://www.allocine.fr/series/ficheserie-$serieId/diffusion-tv/ > temp9
            networkNumber=$(cat temp9 | grep "channel-logo\"" | head -1 | cut -d'"' -f6 | wc -l | awk '{print $1}')
            if [[ $networkNumber -gt 0 ]]; then
              echo "\"networkUrl\":{" >> ./assets/js/data.json

              networkUrl="https://www.allocine.fr/jump/#data-affiliation-type=svod&data-provider=$networkName&data-entity-type=Series&data-entity-id=$serieId"
              echo "\"id1\": \"$networkUrl\"," >> ./assets/js/data.json

              echo "}," >> ./assets/js/data.json
            fi
          elif [[ $networkNumber -gt 0 ]]; then
            echo "\"networkUrl\":{" >> ./assets/js/data.json

            networkUrl="https://www.allocine.fr/jump/#data-affiliation-type=svod&data-provider=$networkName&data-entity-type=Series&data-entity-id=$serieId"
            echo "\"id1\": \"$networkUrl\"," >> ./assets/js/data.json

            echo "}," >> ./assets/js/data.json
          fi
        fi

        # Get Betaseries rating number
        betaseriesRating=$(cat temp9 | grep "stars js-render-stars" | cut -d'"' -f4 | cut -d' ' -f1)
        echo "\"betaseriesRating\": \"$betaseriesRating\"," >> ./assets/js/data.json

        betaseriesStatus=$(cat temp9 | grep -A2 "<strong>Statut</strong>" | tail -1 | sed 's/[ \t]*//')
        if [[ -z $betaseriesStatus ]]; then
          betaseriesStatus=$(cat temp2 | grep "full label-status" | cut -d'>' -f2 | cut -d'<' -f1)
        fi
        echo "\"betaseriesStatus\": \"$betaseriesStatus\"," >> ./assets/js/data.json

        # Add ending bracket
        echo "}," >> ./assets/js/data.json

        # Add IMDb object
        echo "\"imdbData\":{" >> ./assets/js/data.json

        # Get serie date
        curl -s https://www.imdb.com/title/$imdbId/episodes/ > temp7
        date=$(cat temp7 | grep -B20 "ipl-rating-star" | grep -A1 "airdate" | tail -1 | sed -e 's/^[ \t]*//')

        # Get IMDb rating number
        imdbRating=$(cat temp6 | grep -m1 "ratingValue" | cut -d'"' -f4)

        # Add IMDb last episode date, ID and rating number
        echo "\"date\": \"$date\"," >> ./assets/js/data.json
        echo "\"imdbId\": \"$imdbId\"," >> ./assets/js/data.json
        echo "\"imdbRating\": \"$imdbRating\"," >> ./assets/js/data.json
      fi

      # Add ending bracket
      echo "}," >> ./assets/js/data.json

      # Add },{ after every keys
      echo "},{" >> ./assets/js/data.json
    fi

    seriesNumberIndex=$[$seriesNumberIndex+1] id=$[$id+1]
  done
done

# Get double critic to file
cat ./assets/sh/criticNameTemp.txt | sort | uniq -u | grep '2$' > ./assets/sh/criticNameBis.txt
criticNameDoubleNumber=$(cat ./assets/sh/criticNameBis.txt | wc -l | awk '{print $1}')
rm -f ./assets/sh/criticNameArray.txt
for criticNameDoubleNumberIndex in $( eval echo {1..$criticNameDoubleNumber} )
do
  criticNameNode=$(cat ./assets/sh/criticNameBis.txt | head -$criticNameDoubleNumberIndex | tail -1)
  echo "'$criticNameNode'," >> ./assets/sh/criticNameArray.txt
done

# Get duplicate critic to file
cat ./assets/sh/criticNameTemp.txt | sort | uniq -d >> ./assets/sh/criticNameBis.txt
cat ./assets/sh/criticNameBis.txt | sort > ./assets/sh/criticNameBisSorted.txt
criticNameActualNumber=$(cat ./assets/sh/criticNameBisSorted.txt | wc -l | awk '{print $1}')
rm -f ./assets/sh/criticNameCriticButtons.txt
for criticNameActualNumberIndex in $( eval echo {1..$criticNameActualNumber} )
do
  criticNameHTML=$(cat ./assets/sh/criticNameBisSorted.txt | sed 's/2$/ Contre/' | head -$criticNameActualNumberIndex | tail -1)
  echo "<li class=\"criticButton\"><a href=\"#\">$criticNameHTML<span><input id=\"criticToggle$criticNameActualNumberIndex\" type=\"checkbox\" checked=\"checked\"><label for=\"criticToggle$criticNameActualNumberIndex\"></label></span></a></li>" >> ./assets/sh/criticNameCriticButtons.txt
done

# Get used genre
criticNameGenreButtonsNumber=$(cat ./assets/sh/criticNameGenreButtonsTemp.txt | sort | uniq -c | wc -l | awk '{print $1}')
rm -f ./assets/sh/criticNameGenreButtons.txt
for criticNameGenreButtonsNumberIndex in $( eval echo {1..$criticNameGenreButtonsNumber} )
do
  criticNameGenreButtons=$(cat ./assets/sh/criticNameGenreButtonsTemp.txt | sort | uniq -c | cut -c 6- | head -$criticNameGenreButtonsNumberIndex | tail -1)
  echo "<button class=\"btn btn--primary genreButton\" data-group=\"$criticNameGenreButtons\">$criticNameGenreButtons</button>" | tr -d '\n' >> ./assets/sh/criticNameGenreButtons.txt
done
echo "<button class=\"btn btn--primary genreButton\" data-group=\"Non renseigné\">Non renseigné</button>" | tr -d '\n' >> ./assets/sh/criticNameGenreButtons.txt

# Get used network
criticNameNetworkButtonsNumber=$(cat ./assets/sh/criticNameNetworkButtonsTemp.txt | sort | uniq -c | wc -l | awk '{print $1}')
rm -f ./assets/sh/criticNameNetworkButtons.txt
echo "<li class=\"networkButtonTitle\"><a href=\"#\">Streaming<span><input id=\"networkButtonTitle1\" type=\"checkbox\" checked=\"checked\"><label for=\"networkButtonTitle1\"></label></span></a></li>" >> ./assets/sh/criticNameNetworkButtons.txt
for criticNameNetworkButtonsNumberIndex in $( eval echo {1..$criticNameNetworkButtonsNumber} )
do
  criticNameNetworkButtons=$(cat ./assets/sh/criticNameNetworkButtonsTemp.txt | sort | uniq -c | cut -c 6- | head -$criticNameNetworkButtonsNumberIndex | tail -1)
  echo "<li class=\"networkButton\"><a href=\"#\">$criticNameNetworkButtons<span><input id=\"networkButton$criticNameNetworkButtonsNumberIndex\" type=\"checkbox\" checked=\"checked\"><label for=\"networkButton$criticNameNetworkButtonsNumberIndex\"></label></span></a></li>" >> ./assets/sh/criticNameNetworkButtons.txt
done
criticNameNetworkButtonsNumber2=$(cat ./assets/sh/criticNameNetworkButtonsTemp2.txt | sort | uniq -c | wc -l | awk '{print $1}')
echo "<li class=\"networkButtonTitle\"><a href=\"#\">Vidéo à la demande<span><input id=\"networkButtonTitle2\" type=\"checkbox\" checked=\"checked\"><label for=\"networkButtonTitle2\"></label></span></a></li>" >> ./assets/sh/criticNameNetworkButtons.txt
for criticNameNetworkButtonsNumberIndex in $( eval echo {1..$criticNameNetworkButtonsNumber2} )
do
  criticNameNetworkButtonsNumber2Index=$[$criticNameNetworkButtonsNumberIndex+$criticNameNetworkButtonsNumber]
  criticNameNetworkButtons2=$(cat ./assets/sh/criticNameNetworkButtonsTemp2.txt | sort | uniq -c | cut -c 6- | head -$criticNameNetworkButtonsNumberIndex | tail -1)
  echo "<li class=\"networkButton\"><a href=\"#\">$criticNameNetworkButtons2<span><input id=\"networkButton$criticNameNetworkButtonsNumber2Index\" type=\"checkbox\" checked=\"checked\"><label for=\"networkButton$criticNameNetworkButtonsNumber2Index\"></label></span></a></li>" >> ./assets/sh/criticNameNetworkButtons.txt
done
lastCriticNameNetworkButtonsNumber=$[$criticNameNetworkButtonsNumber2Index+1]
echo "<li class=\"networkButton\"><a href=\"#\">Non renseignée<span><input id=\"networkButton$lastCriticNameNetworkButtonsNumber\" type=\"checkbox\" checked=\"checked\"><label for=\"networkButton$lastCriticNameNetworkButtonsNumber\"></label></span></a></li>" >> ./assets/sh/criticNameNetworkButtons.txt

# Get used nationalities
criticNameNationalityButtonsNumber=$(cat ./assets/sh/criticNameNationalityButtonsTemp.txt | sort | uniq -c | wc -l | awk '{print $1}')
rm -f ./assets/sh/criticNameNationalityButtons.txt
for criticNameNationalityButtonsNumberIndex in $( eval echo {1..$criticNameNationalityButtonsNumber} )
do
  criticNameNationalityButtons=$(cat ./assets/sh/criticNameNationalityButtonsTemp.txt | sort | uniq -c | cut -c 6- | head -$criticNameNationalityButtonsNumberIndex | tail -1)
  echo "<li class=\"nationalityButton\"><a href=\"#\">$criticNameNationalityButtons<span><input id=\"nationalityButton$criticNameNationalityButtonsNumberIndex\" type=\"checkbox\" checked=\"checked\"><label for=\"nationalityButton$criticNameNationalityButtonsNumberIndex\"></label></span></a></li>" >> ./assets/sh/criticNameNationalityButtons.txt
done
lastCriticNameNationalityButtonsNumber=$[$criticNameNationalityButtonsNumber+1]
echo "<li class=\"nationalityButton\"><a href=\"#\">Non renseignée<span><input id=\"nationalityButton$lastCriticNameNationalityButtonsNumber\" type=\"checkbox\" checked=\"checked\"><label for=\"nationalityButton$lastCriticNameNationalityButtonsNumber\"></label></span></a></li>" >> ./assets/sh/criticNameNationalityButtons.txt

# Remove lines break and extra commas
cat ./assets/js/data.json | sed '$s/,{/]}/' | tr '\n' ' ' | sed 's/}, ]/}]/g' | sed 's/, },/},/g' | sed 's/......$/ }]}/' | sed 's/, },/},/g' | sed 's/}, }}/}}}/g' | sed 's/,{ "id": "[0-9][0-9]", "allocineData":{ }}//g' | sed 's/,{ "id": "[0-9][0-9][0-9]", "allocineData":{ }}//g' | sed 's/,{ "id": "[0-9][0-9][0-9]", "allocineData":{ } }//g' > temp
cat temp > ./assets/js/data.json

remove_files

# Add ending message with duration
dataDuration=$SECONDS
echo "Complete in $(($dataDuration / 60)) minutes and $(($dataDuration % 60)) seconds ✅"