declare -a imgLinkList=(
    "https://www.autopilotenergy.com/lofitime/Latest%20update/2024-06-19_23-31-52_3530_cr.png"
)

for link in "${imgLinkList[@]}"
do
    # set -f
    # linkSplit=(${link//\// })
    linkSplit=($(echo "$link" | tr '/' '\n'))
    fileName="${linkSplit[-1]}"
    echo "Downloading ${fileName} ..."
    curl -o ./latest_update/$fileName $link
done