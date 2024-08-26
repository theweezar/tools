
declare -a woff2=($(ls | grep .woff2))
declare -a woff=($(ls | grep .woff$))
declare -a ttf=($(ls | grep .ttf))
declare -a svg=($(ls | grep .svg))

for font in "${woff2[@]}"
do
   echo "<link rel='preload' href='\${URLUtils.staticURL('/fonts/$font')}' as='font' type='font/woff2' crossorigin='anonymous' />"
done

for font in "${woff[@]}"
do
   echo "<link rel='preload' href='\${URLUtils.staticURL('/fonts/$font')}' as='font' type='font/woff' crossorigin='anonymous' />"
done

for font in "${ttf[@]}"
do
   echo "<link rel='preload' href='\${URLUtils.staticURL('/fonts/$font')}' as='font' type='font/ttf' crossorigin='anonymous' />"
done

for font in "${svg[@]}"
do
   echo "<link rel='preload' href='\${URLUtils.staticURL('/fonts/$font')}' as='font' type='font/svg' crossorigin='anonymous' />"
done
