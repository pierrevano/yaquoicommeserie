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
}

# Abord script function
abord_script () {
  # Download previous JSON
  curl -s https://yaquoicommeserie.fr/assets/js/data.json > ./assets/js/data.json

  remove_files

  # Exit script
  exit 1
}

remove_files

# Main variables
baseUrl=https://www.allocine.fr/series/top/
seriesNumberIndexFirst=1
pagesNumberMin=1
pagesNumberMax=10
seriesNumberMax=15
imdbResultNumberMax=5
serieCreatorNumber=2
allocineStarNumber=9
SECONDS=0

# Check before starting script
testing=$1
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
      title=$(cat temp2 | grep -m1 "<meta property=\"og:title\" content=\"" | cut -d'"' -f4 | sed 's/&#039;/'"'"'/' | sed 's/[[:blank:]]*$//')
      echo "\"title\": \"$title\"," >> ./assets/js/data.json

      # Get original title for IMDb
      originalTitle=$(cat temp2 | grep -A1 "Titre original" | tail -1 | cut -d'>' -f2 | cut -d'<' -f1 | sed 's/&#039;/'"'"'/' | sed 's/\&amp;/\&/g')
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

      # Add Betaseries object
      echo "\"betaseriesData\":{" >> ./assets/js/data.json

      seriesIdsFile="./assets/sh/seriesIds.txt"
      while IFS= read -r seriesIdsLine <&3; do
        allocineLineUrl=$(echo $seriesIdsLine | cut -d',' -f1)

        if [[ $url == $allocineLineUrl ]]; then
          betaseriesTitle=$(echo $seriesIdsLine | cut -d',' -f3)
          if [[ $betaseriesTitle == 'noBetaseriesId' ]]; then
            curl -s https://www.betaseries.com/serie/$betaseriesTitle > temp9
            echo "--------------------"
            echo "betaseriesTitle: $betaseriesTitle"
            betaseriesFound=2
            break
          fi
          echo "\"betaseriesId\": \"$betaseriesTitle\"," >> ./assets/js/data.json
          curl -s https://www.betaseries.com/serie/$betaseriesTitle > temp9
          betaseriesFound=1
          break
        else
          betaseriesFound=0
        fi
      done 3<$seriesIdsFile

      if [[ $betaseriesFound -eq 0 ]]; then
        # Get betaseries serie page
        betaseriesTitle=$(echo $title | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/betaseries_escape.sed)
        curl -s https://www.betaseries.com/serie/$betaseriesTitle > temp9

        echo "--------------------"
        echo "betaseriesTitle: $betaseriesTitle"

        betaseriesDate=$(cat temp9 | grep -Eo "[0-9]+</time>" | cut -d'<' -f1)
        if [[ $creationDate != $betaseriesDate ]]; then
          betaseriesTitleFormatted=$(echo $betaseriesTitle | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/betaseries_escape.sed)
          curl -s https://www.betaseries.com/serie/$betaseriesTitleFormatted > temp9

          echo "--------------------"
          echo "betaseriesTitleFormatted: $betaseriesTitleFormatted"

          betaseriesDate=$(cat temp9 | grep -Eo "[0-9]+</time>" | cut -d'<' -f1)
          if [[ $creationDate != $betaseriesDate ]]; then
            betaseriesTitleDash=$(echo $betaseriesTitle | sed 's/-//g')
            curl -s https://www.betaseries.com/serie/$betaseriesTitleDash > temp9

            echo "--------------------"
            echo "betaseriesTitleDash: $betaseriesTitleDash"

            betaseriesDate=$(cat temp9 | grep -Eo "[0-9]+</time>" | cut -d'<' -f1)
            if [[ $creationDate != $betaseriesDate ]]; then
              betaseriesTitleMarvel=$(echo $betaseriesTitle | sed 's/^/marvels-/g' | sed 's/-and-/-/g' | sed 's/-the-/-/g')
              curl -s https://www.betaseries.com/serie/$betaseriesTitleMarvel > temp9

              echo "--------------------"
              echo "betaseriesTitleMarvel: $betaseriesTitleMarvel"

              betaseriesDate=$(cat temp9 | grep -Eo "[0-9]+</time>" | cut -d'<' -f1)
              if [[ $creationDate != $betaseriesDate ]]; then
                titleNotOriginal=$(cat temp2 | grep -m1 "<meta property=\"og:title\" content=\"" | cut -d'"' -f4 | sed 's/&#039;/'"'"'/' | sed 's/[[:blank:]]*$//')
                betaseriesTitleNotOriginal=$(echo $titleNotOriginal | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/betaseries_escape.sed)
                curl -s https://www.betaseries.com/serie/$betaseriesTitleNotOriginal > temp9

                echo "--------------------"
                echo "betaseriesTitleNotOriginal: $betaseriesTitleNotOriginal"

                betaseriesDate=$(cat temp9 | grep -Eo "[0-9]+</time>" | cut -d'<' -f1)
                if [[ $creationDate != $betaseriesDate ]]; then
                  curl -s https://www.betaseries.com/serie/$betaseriesTitle-$creationDate > temp9

                  betaseriesDate=$(cat temp9 | grep -Eo "[0-9]+</time>" | cut -d'<' -f1)
                  if [[ $creationDate != $betaseriesDate ]]; then
                    creationDatePrevious=$(($creationDate-1))
                    curl -s https://www.betaseries.com/serie/$betaseriesTitle-$creationDatePrevious > temp9

                    betaseriesDate=$(cat temp9 | grep -Eo "[0-9]+</time>" | cut -d'<' -f1)
                    if [[ $creationDate != $betaseriesDate ]]; then
                      curl -s https://www.betaseries.com/serie/$betaseriesTitleNotOriginal-$creationDate > temp9

                      betaseriesDate=$(cat temp9 | grep -Eo "[0-9]+</time>" | cut -d'<' -f1)
                      if [[ $creationDate != $betaseriesDate ]]; then
                        echo "--------------------"
                        echo "creationDate: $creationDate"
                        echo "betaseriesDate: $betaseriesDate"

                        echo "--------------------"
                        echo "page number $pagesNumberIndex / $pagesNumber"
                        echo "Serie $seriesNumberIndex / $seriesNumber"
                        echo "Betaseries id KO"
                        echo $id / "https://www.allocine.fr$url" ❌

                        abord_script
                      fi
                    fi
                  fi
                fi
              fi
            fi
          fi
        fi

        # Get Betaseries url id
        betaseriesId=$(cat temp9 | grep "og:url" | cut -d'/' -f5 | cut -d'"' -f1)
      fi

      echo "--------------------"
      echo "Betaseries id OK"

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

      # Encode and lowercase IMDb title
      titleURLEncoded=$(echo $title | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/url_escape.sed)
      curl -s "https://www.imdb.com/find?q=$titleURLEncoded&s=tt&ttype=tv" > temp5

      echo "--------------------"
      echo "page number $pagesNumberIndex / $pagesNumber"
      echo "Serie $seriesNumberIndex / $seriesNumber"
      echo "title: $title"
      echo "titleURLEncoded: $titleURLEncoded"

      imdbIdFile="./assets/sh/seriesIds.txt"
      while IFS= read -r imdbIdLine <&3; do
        allocineLineUrl=$(echo $imdbIdLine | cut -d',' -f1)

        if [[ $url == $allocineLineUrl ]]; then
          imdbId=$(echo $imdbIdLine | cut -d',' -f2)
          if [[ $imdbId == 'noImdbId' ]]; then
            curl -s https://www.imdb.com/title/$imdbId/ > temp6
            echo "--------------------"
            echo "imdbId: $imdbId"
            found=2
            break
          fi
          curl -s https://www.imdb.com/title/$imdbId/ > temp6
          found=1
          break
        else
          found=0
        fi
      done 3<$imdbIdFile

      if [[ $found -eq 0 ]]; then
        # Get IMDb id
        imdbId=$(cat temp5 | grep -Eo "<td class=\"primary_photo\"> <a href=\"/title/tt[0-9]+" | sed 's/\/\" ><img src=\"https:\/\/m.media.*$//g' | head -1 | tail -1 | sed "s/.*title\///g")
        curl -s https://www.imdb.com/title/$imdbId/ > temp6

        # Get first IMDb creator
        firstImdbCreator=$(cat temp6 | grep -A2 "Creator" | tail -1 | cut -d'>' -f2 | cut -d'<' -f1 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/imdb_director.sed)

        echo "--------------------"
        echo "imdbId: $imdbId"
        echo "firstImdbCreator: $firstImdbCreator"

        if [[ -z $firstImdbCreator ]]; then
          firstImdbCreator="N/A firstImdbCreator"
        fi

        # Get casting URL
        castingURL=$(cat temp2 | grep ">Casting</a></h2></div>" | cut -d'"' -f8)
        curl -s https://www.allocine.fr$castingURL > temp8

        # Get first AlloCiné creator
        firstAllocineCreator=$(cat temp8 | grep -A30 "cénariste" | grep "thumbnail-container thumbnail-link\" title=\"" | cut -d'"' -f4 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/imdb_director.sed | sed -f ./assets/sed/allocine_escape.sed)
        if [[ -z $firstAllocineCreator ]]; then
          firstAllocineCreator="N/A firstAllocineCreator"
        fi

        for serieCreatorNumberIndex in $( eval echo {1..$serieCreatorNumber} )
        do

          echo "--------------------"
          echo "firstAllocineCreator: $firstAllocineCreator"
          echo "firstImdbCreator: $firstImdbCreator"

          if [[ $firstAllocineCreator != *$firstImdbCreator* ]]; then
            if [[ $serieCreatorNumberIndex -eq 1 ]]; then
              secondAllocineCreator=$(cat temp8 | grep -A100 "cénariste" | grep "thumbnail-container thumbnail-link\" title=\"" | tail -1 | cut -d'"' -f4 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/imdb_director.sed | sed 's/&eacute;/é/g')
              if [[ $secondAllocineCreator == *$firstImdbCreator* ]]; then
                firstAllocineCreator=$secondAllocineCreator

                echo "--------------------"
                echo "firstAllocineCreator: $firstAllocineCreator"
                echo "firstImdbCreator: $firstImdbCreator"

                break
              else
                secondImdbCreator=$(cat temp6 | grep -A3 "Creator" | tail -1 | cut -d'>' -f2 | cut -d'<' -f1 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/imdb_director.sed)
              fi

              if [[ -z $secondAllocineCreator ]]; then
                secondAllocineCreator="N/A secondAllocineCreator"
              fi

              if [[ -z $secondImdbCreator ]]; then
                secondImdbCreator="N/A secondImdbCreator"
              fi

              firstAllocineCreator=$secondAllocineCreator
              firstImdbCreator=$secondImdbCreator
            fi
          else
            break
          fi
        done

        if [[ $firstAllocineCreator != *$firstImdbCreator* ]]; then
          # Loop through IMDb pages
          imdbPageNumber=$(cat temp5 | grep -Eo "<td class=\"primary_photo\"> <a href=\"/title/tt[0-9]+" | wc -l | awk '{print $1}')
          if [[ $imdbPageNumber -eq 1 ]]; then
            imdbPageNumber=2
          elif [[ $imdbPageNumber -gt $imdbResultNumberMax ]]; then
            imdbPageNumber=$imdbResultNumberMax
          fi

          for imdbPageNumberIndex in $( eval echo {2..$imdbPageNumber} )
          do
            imdbPageNumberIndexReal=$[$imdbPageNumberIndex-1]
            imdbPageNumberReal=$[$imdbPageNumber-1]

            echo "--------------------"
            echo "imdbPageNumberIndex: $imdbPageNumberIndex"

            echo "--------------------"
            echo "IMDbpage number $imdbPageNumberIndexReal / $imdbPageNumberReal"

            # Get AlloCiné first star
            firstAllocineStar=$(cat temp8 | grep -A500 "Acteurs et actrices" | grep "title=" | cut -d'"' -f4 | cut -d'<' -f1 | head -1 | tail -1 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/allocine_escape.sed)

            echo "--------------------"
            echo "firstAllocineStar: $firstAllocineStar"

            for allocineStarNumberIndex in $( eval echo {2..$allocineStarNumber} )
            do
              # Get number of IMDb stars
              imdbStarNumber=$(cat temp6 | grep -A4 "<h4 class=\"inline\">Star" | grep -Eo "/name/nm" | wc -l | awk '{print $1}')
              imdbStarHeadLine=3
              for imdbStarNumberIndex in $( eval echo {1..$imdbStarNumber} )
              do
                # Get IMDb star
                imdbStar=$(cat temp6 | grep -A6 "<h4 class=\"inline\">Star" | head -$imdbStarHeadLine | tail -1 | cut -d'>' -f2 | cut -d'<' -f1 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/imdb_director.sed)

                echo "imdbStar: $imdbStar"

                if [[ -z $imdbStar ]]; then
                  imdbStar="N/A imdbStar"
                fi

                if [[ $firstAllocineStar != *$imdbStar* ]]; then
                  imdbStarHeadLine=$[$imdbStarHeadLine+1]
                else
                  break
                fi
              done

              # Loop through second to eighth cast
              if [[ $firstAllocineStar != *$imdbStar* ]]; then
                if [[ $allocineStarNumberIndex -eq 2 ]]; then
                  secondAllocineStar=$(cat temp8 | grep -A500 "Acteurs et actrices" | grep "title=" | cut -d'"' -f4 | cut -d'<' -f1 | head -$allocineStarNumberIndex | tail -1 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/allocine_escape.sed)

                  echo "secondAllocineStar: $secondAllocineStar"

                  firstAllocineStar=$secondAllocineStar
                elif [[ $allocineStarNumberIndex -eq 3 ]]; then
                  thirdAllocineStar=$(cat temp8 | grep -A500 "Acteurs et actrices" | grep "title=" | cut -d'"' -f4 | cut -d'<' -f1 | head -$allocineStarNumberIndex | tail -1 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/allocine_escape.sed)

                  echo "thirdAllocineStar: $thirdAllocineStar"

                  firstAllocineStar=$thirdAllocineStar
                elif [[ $allocineStarNumberIndex -eq 4 ]]; then
                  fourthAllocineStar=$(cat temp8 | grep -A500 "Acteurs et actrices" | grep "title=" | cut -d'"' -f4 | cut -d'<' -f1 | head -$allocineStarNumberIndex | tail -1 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/allocine_escape.sed)

                  echo "fourthAllocineStar: $fourthAllocineStar"

                  firstAllocineStar=$fourthAllocineStar
                elif [[ $allocineStarNumberIndex -eq 5 ]]; then
                  fifthAllocineStar=$(cat temp8 | grep -A500 "Acteurs et actrices" | grep "title=" | cut -d'"' -f4 | cut -d'<' -f1 | head -$allocineStarNumberIndex | tail -1 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/allocine_escape.sed)

                  echo "fifthAllocineStar: $fifthAllocineStar"

                  firstAllocineStar=$fifthAllocineStar
                elif [[ $allocineStarNumberIndex -eq 6 ]]; then
                  sixthAllocineStar=$(cat temp8 | grep -A500 "Acteurs et actrices" | grep "title=" | cut -d'"' -f4 | cut -d'<' -f1 | head -$allocineStarNumberIndex | tail -1 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/allocine_escape.sed)

                  echo "sixthAllocineStar: $sixthAllocineStar"

                  firstAllocineStar=$sixthAllocineStar
                elif [[ $allocineStarNumberIndex -eq 7 ]]; then
                  seventhAllocineStar=$(cat temp8 | grep -A500 "Acteurs et actrices" | grep "title=" | cut -d'"' -f4 | cut -d'<' -f1 | head -$allocineStarNumberIndex | tail -1 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/allocine_escape.sed)

                  echo "seventhAllocineStar: $seventhAllocineStar"

                  firstAllocineStar=$seventhAllocineStar
                elif [[ $allocineStarNumberIndex -eq 8 ]]; then
                  eighthAllocineStar=$(cat temp8 | grep -A500 "Acteurs et actrices" | grep "title=" | cut -d'"' -f4 | cut -d'<' -f1 | head -$allocineStarNumberIndex | tail -1 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/allocine_escape.sed)

                  echo "eighthAllocineStar: $eighthAllocineStar"

                  firstAllocineStar=$eighthAllocineStar
                fi
              else
                break
              fi
            done

            if [[ $firstAllocineStar != *$imdbStar* ]]; then
              imdbId=$(cat temp5 | grep -Eo "<td class=\"primary_photo\"> <a href=\"/title/tt[0-9]+" | sed 's/\/\" ><img src=\"https:\/\/m.media.*$//g' | head -$imdbPageNumberIndex | tail -1 | sed "s/.*title\///g")
              curl -s https://www.imdb.com/title/$imdbId/ > temp6
            else
              break
            fi
          done
        fi

        titleLower=$(echo $title | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/imdb_code.sed | sed 's/ ([0-9][0-9][0-9][0-9])//')
        imdbTitleLower=$(cat temp6 | grep "\"name\": \"" | head -1 | cut -d'"' -f4 | tr '[:upper:]' '[:lower:]' | sed -f ./assets/sed/imdb_code.sed)
        echo "--------------------"
        echo "titleLower: $titleLower"
        echo "imdbTitleLower: $imdbTitleLower"

        # Reset values if still different
        if [[ $titleLower != $imdbTitleLower ]] || { [[ $firstAllocineCreator != *$firstImdbCreator* ]] && [[ $firstAllocineStar != *$imdbStar* ]]; }; then
          echo "--------------------"
          echo "page number $pagesNumberIndex / $pagesNumber"
          echo "Serie $seriesNumberIndex / $seriesNumber"
          echo "IMDb id KO"
          echo $id / "https://www.allocine.fr$url" ❌

          abord_script
        fi

        echo "$url,$imdbId,$betaseriesId" >> assets/sh/seriesIds.txt
      fi

      echo "--------------------"
      echo "IMDb id OK"
      echo "$id $title ✅"

      # Get serie date
      curl -s https://www.imdb.com/title/$imdbId/episodes/ > temp7
      date=$(cat temp7 | grep -B20 "ipl-rating-star" | grep -A1 "airdate" | tail -1 | sed -e 's/^[ \t]*//')

      # Get IMDb rating number
      imdbRating=$(cat temp6 | grep -m1 "ratingValue" | cut -d'"' -f4)

      # If IMDb id doesn't exist yet
      if [[ $found -eq 2 ]]; then
        date=""
        imdbId=""
        imdbRating=""
      fi

      # Add IMDb last episode date, ID and rating number
      echo "\"date\": \"$date\"," >> ./assets/js/data.json
      echo "\"imdbId\": \"$imdbId\"," >> ./assets/js/data.json
      echo "\"imdbRating\": \"$imdbRating\"," >> ./assets/js/data.json
    fi

    # Add ending bracket
    echo "}," >> ./assets/js/data.json

    # Add },{ after every keys
    echo "},{" >> ./assets/js/data.json
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