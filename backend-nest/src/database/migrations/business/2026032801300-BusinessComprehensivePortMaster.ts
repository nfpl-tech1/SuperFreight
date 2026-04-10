import { MigrationInterface, QueryRunner } from 'typeorm';

type PortSeed = {
  name: string;
  countryName: string;
  portMode: 'SEAPORT' | 'AIRPORT';
  unlocode: string | null;
};

const RAW_PORT_DATA = String.raw`Sohar	Oman	SEAPORT	OMSOH
Ain Sokhna (near Suez)	Egypt	SEAPORT	EGSOK
Doha	Qatar	SEAPORT	QAHMD
DAMMAM	Saudi Arabia	SEAPORT	SADMM
SHENZHEN	China	SEAPORT	CNSZX
Shenzhen (Yantian District)	China	SEAPORT	CNYTN
TAICHUNG	Taiwan	SEAPORT	TWTXG
GUANGZHOU	China	SEAPORT	CNCAN
WUHAN	China	SEAPORT	CNWUH
MUMBAI	India	SEAPORT	INNSA
ZHANGJIAGANG	China	SEAPORT	CNZJG
YOKOHAMA	Japan	SEAPORT	JPYOK
XINGANG	China	SEAPORT	CNXGG
XIAMEN	China	SEAPORT	CNXMN
WILHELMSHAVEN	Germany	SEAPORT	DEWVN
VUNG TAU	Vietnam	SEAPORT	VNVTU
VIETNAM	Vietnam	SEAPORT	VNHAN
VERACRUZ	Mexico	SEAPORT	MXVER
US	United States	SEAPORT	USUSA
UK	United Kingdom	SEAPORT	GBLON
TOKYO	Japan	SEAPORT	JPTYO
THAILAND	Thailand	SEAPORT	THTHA
TG PRIOK	Indonesia	SEAPORT	IDTPK
TAIWAN	Taiwan	SEAPORT	TWTWN
TAIPEI	Taiwan	SEAPORT	TWTPE
TACOMA	United States	SEAPORT	USTCM
SYDNEY	Australia	SEAPORT	AUSYD
SURABAYA	Indonesia	SEAPORT	IDSUB
SOUTHAMPTON	United Kingdom	SEAPORT	GBSOU
SONGKHLA	Thailand	SEAPORT	THSGZ
SINGAPORE	Singapore	SEAPORT	SGSIN
SHEKOU	China	SEAPORT	CNSHE
SHANGHAI	China	SEAPORT	CNSHA
SEMARANG	Indonesia	SEAPORT	IDSRG
SEATTLE	United States	SEAPORT	USSEA
SAVANNAH	United States	SEAPORT	USSAV
ROTTERDAM	Netherlands	SEAPORT	NLRTM
QINGDAO	China	SEAPORT	CNTAO
PORT KLANG	Malaysia	SEAPORT	MYPKL
PHILIPPINES	Philippines	SEAPORT	PHMNL
PENANG	Malaysia	SEAPORT	MYPEN
PASIR GUDANG	Malaysia	SEAPORT	MYPGU
OSAKA	Japan	SEAPORT	JPOSA
NORFOLK	United States	SEAPORT	USORF
NINGBO	China	SEAPORT	CNNGB
NEW YORK	United States	SEAPORT	USNYC
NANSHA	China	SEAPORT	CNNSH
NANJING	China	SEAPORT	CNNKG
NAGOYA	Japan	SEAPORT	JPNGO
MELBOURNE	Australia	SEAPORT	AUMEL
LOS ANGELES	United States	SEAPORT	USLAX
LONDON GATEWAY	United Kingdom	SEAPORT	GBLGW
LONDON	United Kingdom	SEAPORT	GBLON
LIANYUNGANG	China	SEAPORT	CNLYG
LEIXOES	Portugal	SEAPORT	PTLEI
LAEM CHABANG	Thailand	SEAPORT	THLCH
LA SPEZIA	Italy	SEAPORT	ITSPZ
KOBE	Japan	SEAPORT	JPUKB
KEELUNG	Taiwan	SEAPORT	TWKEL
KAOHSIUNG	Taiwan	SEAPORT	TWKHH
JEBEL ALI	United Arab Emirates	SEAPORT	AEDXB
JAKARTA TG PRIOK	Indonesia	SEAPORT	IDTPK
JAKARTA	Indonesia	SEAPORT	IDJKT
JACKSONVILLE	United States	SEAPORT	USJAX
HOUSTON	United States	SEAPORT	USHOU
HONG KONG	Hong Kong	SEAPORT	HKHKG
HO CHI MINH CITY	Vietnam	SEAPORT	VNSGN
HELSINGBORG	Sweden	SEAPORT	SEHEL
HAMBURG	Germany	SEAPORT	DEHAM
HAIPHONG	Vietnam	SEAPORT	VNHPH
GENOVA	Italy	SEAPORT	ITGOA
GDYNIA	Poland	SEAPORT	PLGDY
GDANSK	Poland	SEAPORT	PLGDN
FELIXSTOWE	United Kingdom	SEAPORT	GBFXT
DURBAN	South Africa	SEAPORT	ZADUR
DELPHIS	Greece	SEAPORT	GRDLP
COLOMBO	Sri Lanka	SEAPORT	LKCMB
CHINA	China	SEAPORT	CNCHN
CHICAGO	United States	SEAPORT	USCHI
CHARLESTON	United States	SEAPORT	USCHS
CAI MEP	Vietnam	SEAPORT	VNCMP
BUSAN	South Korea	SEAPORT	KRPUS
BREMERHAVEN	Germany	SEAPORT	DEBRV
BREMEN	Germany	SEAPORT	DEBRE
BINTULU	Malaysia	SEAPORT	MYBTU
BELAWAN	Indonesia	SEAPORT	IDBLW
BARCELONA	Spain	SEAPORT	ESBCN
BANGKOK	Thailand	SEAPORT	THBKK
BANDAR PASIR GUDANG	Malaysia	SEAPORT	MYPGU
ANTWERP	Belgium	SEAPORT	BEANR
AALBORG	Denmark	SEAPORT	DKAAL
Zhengzhou	China	AIRPORT	CNCGO
Bangkok	Thailand	AIRPORT	THBKK
Wrocław	Poland	AIRPORT	PLWRO
Villingen-Schwenningen	Germany	AIRPORT	DEZQL
Shanghai	China	AIRPORT	CNPVG
Chicago	United States	AIRPORT	USORD
Amsterdam	Netherlands	AIRPORT	NLAMS
Manila	Philippines	AIRPORT	PHMNL
Narita	Japan	AIRPORT	JPNRT
Münster	Germany	AIRPORT	DEFMO
Modena	Italy	AIRPORT	ITQMD
Łódź	Poland	AIRPORT	PLLCJ
Katowice	Poland	AIRPORT	PLKTW
Kassel	Germany	AIRPORT	DEKSF
Incheon	South Korea	AIRPORT	KRICN
London	United Kingdom	AIRPORT	GBLHR
Düsseldorf	Germany	AIRPORT	DEDUS
Changsha	China	AIRPORT	CNCSX
Zurich (Zürich)	Switzerland	AIRPORT	CHZRH
Zouerate	Mauritania	AIRPORT	MROUZ
Zinder	Niger	AIRPORT	NEZND
Zhob	Pakistan	AIRPORT	PKPZH
Zaragoza	Spain	AIRPORT	ESZAZ
Zakynthos	Greece	AIRPORT	GRZTH
Zacatecas	Mexico	AIRPORT	MXZCL
Yuma (AZ)	USA	AIRPORT	USYUM
Yokohama	Japan	AIRPORT	JPYOK
Yellowknife	Canada	AIRPORT	CAYZF
Yekaterinburg	Russia	AIRPORT	RUSVX
Yaounde	Cameroon	AIRPORT	CMYAO
Yangon (Rangoon)	Myanmar	AIRPORT	MMRGN
Yanbu	Saudi Arabia	AIRPORT	SAYNB
Yamagata, Junmachi	Japan	AIRPORT	JPGAJ
Yakutsk	Russia	AIRPORT	RUYKS
Yakutat (AK)	USA	AIRPORT	USYAK
Yakima (WA)	USA	AIRPORT	USYKM
Wyndham	Australia	AIRPORT	AUWYN
Wrangell (AK)	USA	AIRPORT	USWRG
Worland (WY)	USA	AIRPORT	USWRL
Worcester (MA)	USA	AIRPORT	USORH
Woomera	Australia	AIRPORT	AUUMR
Wollongong	Australia	AIRPORT	AUWOL
Wolf Point (MT)	USA	AIRPORT	USOLF
Winnipeg International	Canada	AIRPORT	CAYWG
Windsor Ontario	Canada	AIRPORT	CAYQG
Windhoek	Namibia	AIRPORT	NAERS
Wiluna	Australia	AIRPORT	AUWUN
Wilna (Vilnius)	Lithuania	AIRPORT	LTVNO
Wilmington (NC)	USA	AIRPORT	USILM
Williston (ND)	USA	AIRPORT	USISL
Williamsport (PA)	USA	AIRPORT	USIPT
Wilkes Barre/Scranton (PA)	USA	AIRPORT	USAVP
Wiesbaden, Air Base	Germany	AIRPORT	DEWIE
Wien (Vienna)	Austria	AIRPORT	ATVIE
Wickham	Australia	AIRPORT	AUWHM
Wick	United Kingdom	AIRPORT	GBWIC
Wichita Falls (TX)	USA	AIRPORT	USSPS
Wichita (KS)	USA	AIRPORT	USICT
Whyalla	Australia	AIRPORT	AUWYA
Whitsunday Resort	Australia	AIRPORT	AUHAP
Whitehorse	Canada	AIRPORT	CAYXY
White Plains (NY)	USA	AIRPORT	USHPN
Whangarei	New Zealand	AIRPORT	NZWRE
Whale Cove, NT	Canada	AIRPORT	CAYXN
Whakatane	New Zealand	AIRPORT	NZWHK
Westerland	Germany	AIRPORT	DEGWT
West Yellowstone (MT)	USA	AIRPORT	USWYS
West Palm Beach (FL)	USA	AIRPORT	USPBI
Wenatchee (WA)	USA	AIRPORT	USEAT
Wellington	New Zealand	AIRPORT	NZWLG
Welkom	South Africa	AIRPORT	ZAWEL
Weipa	Australia	AIRPORT	AUWEI
Wausau/Stevens Point (WI)	USA	AIRPORT	USCWA
Watertown (SD)	USA	AIRPORT	USATY
Waterloo IA	USA	AIRPORT	USALO
Washington DC	USA	AIRPORT	USBWI
Warsaw	Poland	AIRPORT	PLWAW
Warrnambool	Australia	AIRPORT	AUWMB
Walvis Bay	South Africa	AIRPORT	ZAWVB
Walla Walla (WA)	USA	AIRPORT	USALW
Wagga	Australia	AIRPORT	AUWGA
Waco (TX)	USA	AIRPORT	USACT
Wabush	Canada	AIRPORT	CAYWK
Vryheid	South Africa	AIRPORT	ZAVYD
Vitoria	Brazil	AIRPORT	BRVIX
Vitoria	Spain	AIRPORT	ESVIT
Visby	Sweden	AIRPORT	SEVBY
Visalia (CA)	USA	AIRPORT	USVIS
Vilnius	Lithuania	AIRPORT	LTVNO
Villahermosa	Mexico	AIRPORT	MXVSA
Vigo	Spain	AIRPORT	ESVGO
Vidin	Bulgaria	AIRPORT	BGVID
Victoria Falls	Zimbabwe	AIRPORT	ZWVFA
Victoria	Canada	AIRPORT	CAYYJ
Verona (Brescia) Montichiari	Italy	AIRPORT	ITVBS
Verona	Italy	AIRPORT	ITVRN
Vero Beach/Ft. Pierce (FL)	USA	AIRPORT	USVRB
Vernal (UT)	USA	AIRPORT	USVEL
Veracruz	Mexico	AIRPORT	MXVER
Venice	Italy	AIRPORT	ITVCE
Velikiye Luki (Welikije Luki)	Russia	AIRPORT	RUVLU
Vasteras	Sweden	AIRPORT	SEVST
Varna	Bulgaria	AIRPORT	BGVAR
Varkaus	Finland	AIRPORT	FIVRK
Varanasi	India	AIRPORT	INVNS
Varadero	Cuba	AIRPORT	CUVRA
Vancouver	Canada	AIRPORT	CAYVR
Van	Turkey	AIRPORT	TRVAN
Valverde	Spain	AIRPORT	ESVDE
Valparaiso	Chile	AIRPORT	CLVAP
Valladolid	Spain	AIRPORT	ESVLL
Valencia	Venezuela	AIRPORT	VEVLN
Valencia	Spain	AIRPORT	ESVLC
Valdosta (GA)	USA	AIRPORT	USVLD
Valdez (AK)	USA	AIRPORT	USVDZ
Val d'Or	Canada	AIRPORT	CAYVO
Vail (CO)	USA	AIRPORT	USEGE
Vaexjoe	Sweden	AIRPORT	SEVXO
Vaasa	Finland	AIRPORT	FIVAA
Uzhgorod	Ukraine	AIRPORT	UAUDJ
Uummannaq	Greenland	AIRPORT	GLUMD
Utila	Honduras	AIRPORT	HNUII
Utica (NY)	USA	AIRPORT	USUCA
Utapao (Pattaya)	Thailand	AIRPORT	THUTP
Ushuaia	Argentina	AIRPORT	ARUSH
Uruzgan	Afghanistan	AIRPORT	AFURZ
Uruguaiana	Brazil	AIRPORT	BRURG
Urubupunga	Brazil	AIRPORT	BRURB
Uruapan	Mexico	AIRPORT	MXUPN
Urmiehm (Orumieh)	Iran	AIRPORT	IROMH
Uriman	Venezuela	AIRPORT	VEURM
Urgench	Uzbekistan	AIRPORT	UZUGC
Uranium City	Canada	AIRPORT	CAYBE
Upolu Point (HI)	USA	AIRPORT	USUPP
Upington	South Africa	AIRPORT	ZAUTN
Upernavik	Greenland	AIRPORT	GLJUV
Upala	Costa Rica	AIRPORT	CRUPL
Unst (Shetland Island)	United Kingdom	AIRPORT	GBUNT
Union Island	Saint Vincent and the Grenadines	AIRPORT	VCUNI
Unalakleet (AK)	USA	AIRPORT	USUNK
Umtata	South Africa	AIRPORT	ZAUTT
Umiujaq	Canada	AIRPORT	CAYUD
Umea	Sweden	AIRPORT	SEUME
Ulundi	South Africa	AIRPORT	ZAULD
Ulsan	South Korea	AIRPORT	KRUSN
Ulei	Vanuatu	AIRPORT	VUULB
Ulan	Russia	AIRPORT	RUUUD
Ulaanbaatar	Mongolia	AIRPORT	MNULN
Ukiah (CA)	USA	AIRPORT	USUKI
Ukhta	Russia	AIRPORT	RUUCT
Ujung Pandang	Indonesia	AIRPORT	IDUPG
Uige	Angola	AIRPORT	AOUGO
Uherske Hradiste	Czech Republic	AIRPORT	CZUHE
Ufa	Russia	AIRPORT	RUUFA
Udon Thani	Thailand	AIRPORT	THUTH
Uden	Netherlands	AIRPORT	NLUDE
Udaipur	India	AIRPORT	INUDR
Ubon Ratchathani	Thailand	AIRPORT	THUBP
Uberlandia	Brazil	AIRPORT	BRUDI
Uberaba	Brazil	AIRPORT	BRUBA
Ube	Japan	AIRPORT	JPUBJ
Ua Pou	French Polynesia	AIRPORT	PFUAP
Ua Huka	French Polynesia	AIRPORT	PFUAH
Tyler (TX)	USA	AIRPORT	USTYR
Twin Falls (ID)	USA	AIRPORT	USTWF
Tuxtla Gutierrez	Mexico	AIRPORT	MXTGZ
Tuscaloosa (AL)	USA	AIRPORT	USTCL
Turku	Finland	AIRPORT	FITKU
Turin	Italy	AIRPORT	ITTRN
Turbat	Pakistan	AIRPORT	PKTUK
Tunis	Tunisia	AIRPORT	TNTUN
Tulsa (OK)	USA	AIRPORT	USTUL
Tulepo (MS)	USA	AIRPORT	USTUP
Tucson (AZ)	USA	AIRPORT	USTUS
Tsumeb	Namibia	AIRPORT	NATSB
Trondheim	Norway	AIRPORT	NOTRD
Tromsoe	Norway	AIRPORT	NOTOS
Tripoli	Libya	AIRPORT	LYTIP
Trieste	Italy	AIRPORT	ITTRS
Tri	USA	AIRPORT	USTRI
Treviso	Italy	AIRPORT	ITTSF
Trenton/Princeton (NJ)	USA	AIRPORT	USTTN
Treasure Cay	Bahamas	AIRPORT	BSTCB
Traverse City (MI)	USA	AIRPORT	USTVC
Trapani	Italy	AIRPORT	ITTPS
Trabzon	Turkey	AIRPORT	TRTZX
Toyama	Japan	AIRPORT	JPTOY
Townsville	Australia	AIRPORT	AUTSV
Toulouse	France	AIRPORT	FRTLS
Touho	New Caledonia	AIRPORT	NCTOU
Tortola	British Virgin Islands	AIRPORT	VGTOV
Toronto	Canada	AIRPORT	CAYYZ
Toowoomba	Australia	AIRPORT	AUTWB
Tom Price	Australia	AIRPORT	AUTPR
Toledo (OH)	USA	AIRPORT	USTOL
Tokyo	Japan	AIRPORT	JPNRT
Tokushima	Japan	AIRPORT	JPTKS
Tobago	Trinidad and Tobago	AIRPORT	TTTAB
Tivat	Montenegro	AIRPORT	METIV
Tiruchirapally	India	AIRPORT	INTRZ
Tirana	Albania	AIRPORT	ALTIA
Tioman	Indonesia	AIRPORT	IDTOD
Tijuana	Mexico	AIRPORT	MXTIJ
Tianjin	China	AIRPORT	CNTSN
Thursday Island	Australia	AIRPORT	AUTIS
Thunder Bay	Canada	AIRPORT	CAYQT
Thorne Bay (AK)	USA	AIRPORT	USKTB
Thompson	Canada	AIRPORT	CAYTH
Thisted	Denmark	AIRPORT	DKTED
Thiruvananthapuram	India	AIRPORT	INTRV
Thira	Greece	AIRPORT	GRJTR
Thief River Falls (MN)	USA	AIRPORT	USTVF
Thessaloniki	Greece	AIRPORT	GRSKG
The Pas	Canada	AIRPORT	CAYQD
Thaba'Nchu	South Africa	AIRPORT	ZATCU
Texarkana (AR)	USA	AIRPORT	USTXK
Terre Haute (IN)	USA	AIRPORT	USHUF
Terrace	Canada	AIRPORT	CAYXT
Termez (Termes)	Uzbekistan	AIRPORT	UZTMZ
Teresina	Brazil	AIRPORT	BRTHE
Terceira	Portugal	AIRPORT	PTTER
Tennant Creek	Australia	AIRPORT	AUTCA
Tenerife	Spain	AIRPORT	ESTFS
Temora	Australia	AIRPORT	AUTEM
Telluride (CO)	USA	AIRPORT	USTEX
Tel Aviv	Israel	AIRPORT	ILTLV
Tekirdag	Turkey	AIRPORT	TRTEQ
Tehran (Teheran)	Iran	AIRPORT	IRTHR
Tegucigalpa	Honduras	AIRPORT	HNTGU
Teesside, Durham Tees Valley	United Kingdom	AIRPORT	GBMME
Te Anau	New Zealand	AIRPORT	NZTEU
Tbilisi	Georgia	AIRPORT	GETBS
Tawau	Malaysia	AIRPORT	MYTWU
Tashkent	Uzbekistan	AIRPORT	UZTAS
Targovishte	Bulgaria	AIRPORT	BGTGV
Taree	Australia	AIRPORT	AUTRO
Tangier	Morocco	AIRPORT	MATNG
Tamworth	Australia	AIRPORT	AUTMW
Tampico	Mexico	AIRPORT	MXTAM
Tampere	Finland	AIRPORT	FITMP
Tampa	USA	AIRPORT	USTPA
Tallinn	Estonia	AIRPORT	EETLL
Tallahassee (FL)	USA	AIRPORT	USTLH
Talkeetna (AK)	USA	AIRPORT	USTKA
Takamatsu	Japan	AIRPORT	JPTAK
Taipei	Taiwan	AIRPORT	TWTAY
Taif	Saudi Arabia	AIRPORT	SATIF
Tabuk	Saudi Arabia	AIRPORT	SATUU
Syracuse (NY)	USA	AIRPORT	USSYR
Sylhet	Bangladesh	AIRPORT	BDZYL
Sydney	Australia	AIRPORT	AUSYD
Swakopmund	Namibia	AIRPORT	NASWP
Suva	Fiji	AIRPORT	FJSUV
Surat	India	AIRPORT	INSTV
Surabaya	Indonesia	AIRPORT	IDSUB
Sunshine Coast	Australia	AIRPORT	AUMCY
Sundsvall	Sweden	AIRPORT	SESDL
Sun Valley (ID)	USA	AIRPORT	USSUN
Sumburgh (Shetland)	United Kingdom	AIRPORT	GBLSI
Sukkur	Pakistan	AIRPORT	PKSKZ
Sui	Pakistan	AIRPORT	PKSUL
Stuttgart	Germany	AIRPORT	DESTR
Streaky Bay	Australia	AIRPORT	AUKBY
Strasbourg	France	AIRPORT	FRSXB
Stornway	United Kingdom	AIRPORT	GBSYY
Stockton (CA)	USA	AIRPORT	USSCK
Stockholm Metropolitan Area	Sweden	AIRPORT	SESTO
Stockholm	Sweden	AIRPORT	SEBMA
Stettin	Poland	AIRPORT	PLSZZ
Steamboat Springs (CO)	USA	AIRPORT	USHDN
Stavanger	Norway	AIRPORT	NOSVG
State College/Belefonte (PA)	USA	AIRPORT	USSCE
Stansted (London)	United Kingdom	AIRPORT	GBSTN
St. Vincent	Saint Vincent and the Grenadines	AIRPORT	VCSVD
St. Pierre, NF	Canada	AIRPORT	CAFSP
St. Petersburg (Leningrad)	Russia	AIRPORT	RULED
St. Marteen	Netherlands Antilles	AIRPORT	ANSXM
St. Lucia Vigle	Saint Lucia	AIRPORT	LCSLU
St. Lucia Hewanorra	Saint Lucia	AIRPORT	LCUVF
St. John's	Canada	AIRPORT	CAYYT
St. George (UT)	USA	AIRPORT	USSGU
St. Etienne	France	AIRPORT	FREBU
St. Augustin, PQ	Canada	AIRPORT	CAYIF
Srinagar	India	AIRPORT	INSXR
Springfield (IL)	USA	AIRPORT	USSPI
Springfield (MO)	USA	AIRPORT	USSGF
Springbok	South Africa	AIRPORT	ZASBU
Spokane (WA)	USA	AIRPORT	USGEG
Southend (London)	United Kingdom	AIRPORT	GBSEN
Southampton	United Kingdom	AIRPORT	GBSOU
South Molle Island	Australia	AIRPORT	AUSOI
South Indian Lake, MB	Canada	AIRPORT	CAXSI
South Bend (IN)	USA	AIRPORT	USSBN
Sogndal	Norway	AIRPORT	NOSOG
Sofia	Bulgaria	AIRPORT	BGSOF
Soendre Stroemfjord	Greenland	AIRPORT	GLSFJ
Soenderborg	Denmark	AIRPORT	DKSGD
Sodankylae	Finland	AIRPORT	FISOT
Smithers	Canada	AIRPORT	CAYYD
Sligo	Ireland	AIRPORT	IESXL
Skukuza	South Africa	AIRPORT	ZASZK
Skrydstrup	Denmark	AIRPORT	DKSKS
Skopje	Macedonia	AIRPORT	MKSKP
Skiathos	Greece	AIRPORT	GRJSI
Skardu	Pakistan	AIRPORT	PKKDU
Skagway (AK)	USA	AIRPORT	USSGY
Siwa	Egypt	AIRPORT	EGSEW
Sivas	Turkey	AIRPORT	TRVAS
Sitka (AK)	USA	AIRPORT	USSIT
Sishen	South Africa	AIRPORT	ZASIS
Sioux Falls (SD)	USA	AIRPORT	USFSD
Sioux City IA	USA	AIRPORT	USSUX
Singleton	Australia	AIRPORT	AUSIX
Singapore	Singapore	AIRPORT	SGXSP
Sindhri	Pakistan	AIRPORT	PKMPD
Simferopol	Ukraine	AIRPORT	UASIP
Silistra	Bulgaria	AIRPORT	BGSLS
Sidney (MT)	USA	AIRPORT	USSDY
Sibu	Malaysia	AIRPORT	MYSBW
Shute Harbour	Australia	AIRPORT	AUJHQ
Shreveport, La	USA	AIRPORT	USSHV
Sheridan (WY)	USA	AIRPORT	USSHR
Shenandoah Valley/Stauton (VA)	USA	AIRPORT	USSHD
Sheffield,	United Kingdom	AIRPORT	GBSZD
Sharm El Sheikh	Egypt	AIRPORT	EGSSH
Sharjah	United Arab Emirates	AIRPORT	AESHJ
Shannon (Limerick)	Ireland	AIRPORT	IESNN
Shamattawa, MB	Canada	AIRPORT	CAZTM
Sfax	Tunisia	AIRPORT	TNSFA
Sevilla	Spain	AIRPORT	ESSVQ
Seoul	South Korea	AIRPORT	KRSEL
Sendai	Japan	AIRPORT	JPSDJ
Selibi Phikwe	Botswana	AIRPORT	BWPKW
Seinaejoki	Finland	AIRPORT	FISJY
Sehba	Libya	AIRPORT	LYSEB
Seattle/Tacoma (WA)	USA	AIRPORT	USSEA
Scottsdale (AZ)	USA	AIRPORT	USSCF
Scone	Australia	AIRPORT	AUNSO
Scarborough	Trinidad and Tobago	AIRPORT	TTTAB
Savonlinna	Finland	AIRPORT	FISVL
Savannah (GA)	USA	AIRPORT	USSAV
Saskatoon	Canada	AIRPORT	CAYXE
Sarasota/Bradenton (FL)	USA	AIRPORT	USSRQ
Saransk	Russia	AIRPORT	RUSKX
Sarajevo	Bosnia and Herzegovina	AIRPORT	BASJJ
Sapporo	Japan	AIRPORT	JPCTS
Sao Paulo	Brazil	AIRPORT	BRVCP
Sao Luis	Brazil	AIRPORT	BRSLZ
Santo Domingo	Dominican Republic	AIRPORT	DOSDQ
Santo	Vanuatu	AIRPORT	VUSON
Santiago de Compostela	Spain	AIRPORT	ESSCQ
Santiago de Chile	Chile	AIRPORT	CLSCL
Santiago	Cuba	AIRPORT	CUSCU
Santander	Spain	AIRPORT	ESSDR
Santa Rosalia	Mexico	AIRPORT	MXSRL
Santa Rosalia	Colombia	AIRPORT	COSSL
Santa Rosa, Copan	Honduras	AIRPORT	HNSDH
Santa Rosa (CA)	USA	AIRPORT	USSTS
Santa Rosa	Argentina	AIRPORT	ARRSA
Santa Rosa	Brazil	AIRPORT	BRSRA
Santa Rosa	Bolivia	AIRPORT	BOSRB
Santa Maria (CA)	USA	AIRPORT	USSMX
Santa Maria	Portugal	AIRPORT	PTSMA
Santa Katarina	Egypt	AIRPORT	EGSKV
Santa Cruz de la Sierra	Bolivia	AIRPORT	BOSRZ
Santa Cruz de la Palma	Spain	AIRPORT	ESSPC
Santa Barbara (CA)	USA	AIRPORT	USSBA
Santa Ana	USA	AIRPORT	USSNA
Sandspit	Canada	AIRPORT	CAYZP
Sanaa (Sana'a)	Yemen	AIRPORT	YESAH
San Sebastian	Spain	AIRPORT	ESEAS
San Salvador	El Salvador	AIRPORT	SVSAL
San Salvador	Bahamas	AIRPORT	BSZSA
San Pedro Sula	Honduras	AIRPORT	HNSAP
San Luis Potosi	Mexico	AIRPORT	MXSLP
San Luis Obisco (CA)	USA	AIRPORT	USSBP
San Juan	Puerto Rico	AIRPORT	PRSJU
San Jose (CA)	USA	AIRPORT	USSJC
San Jose Cabo	Mexico	AIRPORT	MXSJD
San Jose	Costa Rica	AIRPORT	CRSJO
San Francisco	USA	AIRPORT	USSFO
San Diego	USA	AIRPORT	USSAN
San Carlos de Bariloche	Argentina	AIRPORT	ARBRC
San Antonio (TX)	USA	AIRPORT	USSAT
San Angelo (TX)	USA	AIRPORT	USSJT
San Andres	Colombia	AIRPORT	COADZ
Samsun	Turkey	AIRPORT	TRSZF
Samos	Greece	AIRPORT	GRSMI
Samarkand	Uzbekistan	AIRPORT	UZSKD
Samara	Russia	AIRPORT	RUKUF
Samana	Dominican Republic	AIRPORT	DOAZS
Salzburg	Austria	AIRPORT	ATSZG
Salvador	Brazil	AIRPORT	BRSSA
Salta, Gen Belgrano	Argentina	AIRPORT	ARSLA
Salt Lake City (UT)	USA	AIRPORT	USSLC
Saloniki	Greece	AIRPORT	GRSKG
Salisbury (MD)	USA	AIRPORT	USSBY
Salisbury	Zimbabwe	AIRPORT	ZWSAY
Salinas (CA)	USA	AIRPORT	USSNS
Salinas	Ecuador	AIRPORT	ECSNC
Salem (OR)	USA	AIRPORT	USSLE
Salalah	Oman	AIRPORT	OMSLL
Sal	Cape Verde	AIRPORT	CVSID
Saipan	Northern Mariana Islands	AIRPORT	MPSPN
Saint John	Canada	AIRPORT	CAYSJ
Saint Denis	Reunion	AIRPORT	RERUN
Saint Brieuc	France	AIRPORT	FRSBK
Saidu Sharif	Pakistan	AIRPORT	PKSDT
Saginaw/Bay City/Midland (MI)	USA	AIRPORT	USMBS
Sado Shima	Japan	AIRPORT	JPSDS
Sacramento (CA)	USA	AIRPORT	USSMF
Saarbruecken	Germany	AIRPORT	DESCN
Ruse	Bulgaria	AIRPORT	BGROU
Rundu	Namibia	AIRPORT	NANDU
Rovaniemi	Finland	AIRPORT	FIRVN
Rotterdam	Netherlands	AIRPORT	NLRTM
Rotorua	New Zealand	AIRPORT	NZROT
Rostov	Russia	AIRPORT	RURVI
Rosario	Argentina	AIRPORT	ARROS
Ronneby	Sweden	AIRPORT	SERNB
Rome	Italy	AIRPORT	ITFCO
Roenne	Denmark	AIRPORT	DKRNN
Rodrigues Island	Mauritius	AIRPORT	MURRG
Rodez	France	AIRPORT	FRRDZ
Rocky Mount	USA	AIRPORT	USRWI
Rockland (ME)	USA	AIRPORT	USRKD
Rockhampton	Australia	AIRPORT	AUROK
Rockford (IL)	USA	AIRPORT	USRFD
Rock Springs (WY)	USA	AIRPORT	USRKS
Rock Sound	Bahamas	AIRPORT	BSRSD
Rochester (NY)	USA	AIRPORT	USROC
Rochester (MN)	USA	AIRPORT	USRST
Roatan	Honduras	AIRPORT	HNRTB
Roanoke (VA)	USA	AIRPORT	USROA
Roanne	France	AIRPORT	FRRNE
Riyadh	Saudi Arabia	AIRPORT	SARUH
Rio de Janeiro	Brazil	AIRPORT	BRSDU
Rio Branco	Brazil	AIRPORT	BRRBR
Rimini	Italy	AIRPORT	ITRMI
Riga	Latvia	AIRPORT	LVRIX
Richmond (VA)	USA	AIRPORT	USRIC
Richards Bay	South Africa	AIRPORT	ZARCB
Rhodos	Greece	AIRPORT	GRRHO
Rhinelander (WI)	USA	AIRPORT	USRHI
Reykjavik	Iceland	AIRPORT	ISREK
Reus	Spain	AIRPORT	ESREU
Resolute Bay	Canada	AIRPORT	CAYRB
Reno (NV)	USA	AIRPORT	USRNO
Rennes	France	AIRPORT	FRRNS
Regina	Canada	AIRPORT	CAYQR
Reggio Calabria	Italy	AIRPORT	ITREG
Redmond (OR)	USA	AIRPORT	USRDM
Redding (CA)	USA	AIRPORT	USRDD
Recife	Brazil	AIRPORT	BRREC
Reading (PA)	USA	AIRPORT	USRDG
Rawalpindi	Pakistan	AIRPORT	PKRWP
Rawala Kot	Pakistan	AIRPORT	PKRAZ
Ras al Khaymah (Ras al Khaimah)	United Arab Emirates	AIRPORT	AERKT
Rapid City (SD)	USA	AIRPORT	USRAP
Rangoon (Yangon)	Myanmar	AIRPORT	MMRGN
Rangiroa	French Polynesia	AIRPORT	PFRGI
Ranchi	India	AIRPORT	INIXR
Raleigh/Durham (NC)	USA	AIRPORT	USRDU
Rajkot	India	AIRPORT	INRAJ
Rainbow Lake, AB	Canada	AIRPORT	CAYOP
Raiatea	French Polynesia	AIRPORT	PFRFP
Rahim Yar Khan	Pakistan	AIRPORT	PKRYK
Rabat	Morocco	AIRPORT	MARBA
Quito	Ecuador	AIRPORT	ECUIO
Quincy (IL)	USA	AIRPORT	USUIN
Quimper	France	AIRPORT	FRUIP
Quetta	Pakistan	AIRPORT	PKUET
Queenstown	New Zealand	AIRPORT	NZZQN
Queenstown	Australia	AIRPORT	AUUEE
Quebec	Canada	AIRPORT	CAYQB
Pyongyang	North Korea	AIRPORT	KPFNJ
Punta Cana	Dominican Republic	AIRPORT	DOPUJ
Punta Arenas	Chile	AIRPORT	CLPUQ
Pullman (WA)	USA	AIRPORT	USPUW
Pukatawagan	Canada	AIRPORT	CAXPK
Puerto Vallarta	Mexico	AIRPORT	MXPVR
Puerto Plata	Dominican Republic	AIRPORT	DOPOP
Puerto Ordaz	Venezuela	AIRPORT	VEPZO
Puerto Escondido	Mexico	AIRPORT	MXPXM
Pueblo (CO)	USA	AIRPORT	USPUB
Puebla	Mexico	AIRPORT	MXPBC
Pu San (Busan)	South Korea	AIRPORT	KRPUS
Prudhoe Bay (AK)	USA	AIRPORT	USSCC
Providence (RI)	USA	AIRPORT	USPVD
Prosperpine	Australia	AIRPORT	AUPPP
Pristina	Serbia	AIRPORT	RSPRN
Prince Rupert/Digby Island	Canada	AIRPORT	CAYPR
Prince George	Canada	AIRPORT	CAYXS
Preveza/Lefkas	Greece	AIRPORT	GRPVK
Pretoria	South Africa	AIRPORT	ZAPRY
Presque Island (ME)	USA	AIRPORT	USPQI
Praia	Cape Verde	AIRPORT	CVRAI
Prague	Czech Republic	AIRPORT	CZPRG
Poznan, Lawica	Poland	AIRPORT	PLPOZ
Poughkeepsie (NY)	USA	AIRPORT	USPOU
Porto Velho	Brazil	AIRPORT	BRPVH
Porto Santo	Portugal	AIRPORT	PTPXO
Porto Alegre	Brazil	AIRPORT	BRPOA
Porto	Portugal	AIRPORT	PTOPO
Portland International (OR)	USA	AIRPORT	USPDX
Portland (ME)	USA	AIRPORT	USPWM
Portland	Australia	AIRPORT	AUPTJ
Port Vila	Vanuatu	AIRPORT	VUVLI
Port Said	Egypt	AIRPORT	EGPSD
Port of Spain	Trinidad and Tobago	AIRPORT	TTPOS
Port Moresby	Papua New Guinea	AIRPORT	PGPOM
Port Menier, PQ	Canada	AIRPORT	CAYPN
Port Macquarie	Australia	AIRPORT	AUPQQ
Port Lincoln	Australia	AIRPORT	AUPLO
Port Hedland	Australia	AIRPORT	AUPHE
Port Harcourt	Nigeria	AIRPORT	NGPHC
Port Gentil	Gabon	AIRPORT	GAPOG
Port Elizabeth	South Africa	AIRPORT	ZAPLZ
Port Augusta	Australia	AIRPORT	AUPUG
Port au Prince	Haiti	AIRPORT	HTPAP
Port Angeles (WA)	USA	AIRPORT	USCLM
Pori	Finland	AIRPORT	FIPOR
Ponta Delgada	Portugal	AIRPORT	PTPDL
Ponce	Puerto Rico	AIRPORT	PRPSE
Poitiers	France	AIRPORT	FRPIS
Pohnpei	Micronesia	AIRPORT	FMPNI
Podgorica	Montenegro	AIRPORT	METGD
Pocatello (ID)	USA	AIRPORT	USPIH
Plettenberg Bay	South Africa	AIRPORT	ZAPBZ
Plattsburgh (NY)	USA	AIRPORT	USPLB
Pittsburgh	USA	AIRPORT	USPIT
Pisa	Italy	AIRPORT	ITPSA
Pilanesberg/Sun City	South Africa	AIRPORT	ZANTY
Pietersburg	South Africa	AIRPORT	ZAPTG
Pietermaritzburg	South Africa	AIRPORT	ZAPZB
Pierre (SD)	USA	AIRPORT	USPIR
Phuket	Thailand	AIRPORT	THHKT
Phoenix (AZ)	USA	AIRPORT	USPHX
Phnom Penh	Cambodia	AIRPORT	KHPNH
Philadelphia (PA)	USA	AIRPORT	USPHL
Phalaborwa	South Africa	AIRPORT	ZAPHW
Petersburg (AK)	USA	AIRPORT	USPSG
Peshawar	Pakistan	AIRPORT	PKPEW
Pescara	Italy	AIRPORT	ITPSR
Perugia	Italy	AIRPORT	ITPEG
Perth International	Australia	AIRPORT	AUPER
Perpignan	France	AIRPORT	FRPGF
Pereira	Colombia	AIRPORT	COPEI
Peoria/Bloomington (IL)	USA	AIRPORT	USPIA
Pensacola (FL)	USA	AIRPORT	USPNS
Pendelton (OR)	USA	AIRPORT	USPDT
Penang International	Malaysia	AIRPORT	MYPEN
Pellston (MI)	USA	AIRPORT	USPLN
Pau	France	AIRPORT	FRPUF
Pattaya	Thailand	AIRPORT	THPYX
Patna	India	AIRPORT	INPAT
Pasni	Pakistan	AIRPORT	PKPSI
Pasco (WA)	USA	AIRPORT	USPSC
Paro	Bhutan	AIRPORT	BTPBH
Paris	France	AIRPORT	FRORY
Paramaribo	Suriname	AIRPORT	SRPBM
Paraburdoo	Australia	AIRPORT	AUPBO
Paphos	Cyprus	AIRPORT	CYPFO
Pantelleria	Italy	AIRPORT	ITPNL
Panjgur	Pakistan	AIRPORT	PKPJG
Panama City	Panama	AIRPORT	PAPTY
Panama City (FL)	USA	AIRPORT	USPFN
Palmerston North	New Zealand	AIRPORT	NZPMR
Palmdale/Lancaster (CA)	USA	AIRPORT	USPMD
Palmas	Brazil	AIRPORT	BRPMW
Palma de Mallorca	Spain	AIRPORT	ESPMI
Palm Springs (CA)	USA	AIRPORT	USPSP
Palermo	Italy	AIRPORT	ITPMO
Pakersburg (WV) /Marietta (OH)	USA	AIRPORT	USPKB
Pago Pago	American Samoa	AIRPORT	ASPPG
Page/Lake Powell (AZ)	USA	AIRPORT	USPGA
Paducah (KY)	USA	AIRPORT	USPAH
Paderborn/Lippstadt	Germany	AIRPORT	DEPAD
Oxnard (CA)	USA	AIRPORT	USOXR
Owensboro (KY)	USA	AIRPORT	USOWB
Oviedo	Spain	AIRPORT	ESOVD
Out Skerries (Shetland)	United Kingdom	AIRPORT	GBOUK
Oulu	Finland	AIRPORT	FIOUL
Oujda	Morocco	AIRPORT	MAOUD
Oudtshoorn	South Africa	AIRPORT	ZAOUH
Ouarzazate	Morocco	AIRPORT	MAOZZ
Ouagadougou	Burkina Faso	AIRPORT	BFOUA
Ouadda	Central African Republic	AIRPORT	CFODA
Ottawa	Canada	AIRPORT	CAYOW
Oslo	Norway	AIRPORT	NOTRF
Oshkosh (WI)	USA	AIRPORT	USOSH
Osaka, Metropolitan Area	Japan	AIRPORT	JPOSA
Osaka	Japan	AIRPORT	JPKIX
Orpheus Island	Australia	AIRPORT	AUORS
Orlando Metropolitan Area (FL)	USA	AIRPORT	USORL
Orlando	USA	AIRPORT	USMCO
Orkney	United Kingdom	AIRPORT	GBKOI
Oranjestad	Aruba	AIRPORT	AWAUA
Oranjemund	Namibia	AIRPORT	NAOMD
Orange County (Santa Ana) (CA)	USA	AIRPORT	USSNA
Orange	Australia	AIRPORT	AUOAG
Oran (Ouahran)	Algeria	AIRPORT	DZORN
Ontario (CA)	USA	AIRPORT	USONT
Ondangwa	Namibia	AIRPORT	NAOND
Omaha (NE)	USA	AIRPORT	USOMA
Olympic Dam	Australia	AIRPORT	AUOLP
Olbia	Italy	AIRPORT	ITOLB
Oklahoma City (OK)	USA	AIRPORT	USOKC
Okinawa, Ryukyo Island	Japan	AIRPORT	JPOKA
Okayama	Japan	AIRPORT	JPOKJ
Oita	Japan	AIRPORT	JPOIT
Ohrid	Macedonia	AIRPORT	MKOHD
Oerebro	Sweden	AIRPORT	SEORB
Odessa	Ukraine	AIRPORT	UAODS
Odense	Denmark	AIRPORT	DKODE
Oaxaca	Mexico	AIRPORT	MXOAX
Oakland (CA)	USA	AIRPORT	USOAK
Nürnberg (Nuremberg)	Germany	AIRPORT	DENUE
Nuku'alofa	Tonga	AIRPORT	TOTBU
Nuevo Laredo	Mexico	AIRPORT	MXNLD
Novosibirsk	Russia	AIRPORT	RUOVB
Novi Sad	Serbia	AIRPORT	RSQND
Noumea	New Caledonia	AIRPORT	NCNOU
Nouakchott	Mauritania	AIRPORT	MRNKC
Nouadhibou	Mauritania	AIRPORT	MRNDB
Nottingham	United Kingdom	AIRPORT	GBEMA
Norwich	United Kingdom	AIRPORT	GBNWI
North Eleuthera	Bahamas	AIRPORT	BSELH
North Bend (OR)	USA	AIRPORT	USOTH
Norrkoeping	Sweden	AIRPORT	SENRK
Norman Wells	Canada	AIRPORT	CAYVQ
Norfolk/Virginia Beach (VA)	USA	AIRPORT	USORF
Norfolk Island	Australia	AIRPORT	AUNLK
Noosa	Australia	AIRPORT	AUNSA
Nome (AK)	USA	AIRPORT	USOME
Nizhny Novgorod	Russia	AIRPORT	RUGOJ
Nis	Serbia	AIRPORT	RSINI
Nimes	France	AIRPORT	FRFNI
Nikolaev	Ukraine	AIRPORT	UANLV
Niigata	Japan	AIRPORT	JPKIJ
Nicosia	Cyprus	AIRPORT	CYNIC
Nice	France	AIRPORT	FRNCE
Niamey	Niger	AIRPORT	NENIM
Niagara Falls International	USA	AIRPORT	USIAG
N'Gaoundere	Cameroon	AIRPORT	CMNGE
Newquay	United Kingdom	AIRPORT	GBNQY
Newport News/Williamsburg (VA)	USA	AIRPORT	USPHF
Newman	Australia	AIRPORT	AUZNE
Newcastle	Australia	AIRPORT	AUNTL
Newcastle	South Africa	AIRPORT	ZANCS
Newcastle	United Kingdom	AIRPORT	GBNCL
Newburgh (NY)	USA	AIRPORT	USSWF
New York (NY)	USA	AIRPORT	USNYC
New York	USA	AIRPORT	USEWR
New Valley	Egypt	AIRPORT	EGUVL
New Orleans, La	USA	AIRPORT	USMSY
New Haven (CT)	USA	AIRPORT	USHVN
New Bern (NC)	USA	AIRPORT	USEWN
Nelspruit	South Africa	AIRPORT	ZAMQP
Nelson	New Zealand	AIRPORT	NZNSN
N'Dola	Zambia	AIRPORT	ZMNLA
N'Djamena	Chad	AIRPORT	TDNDJ
Naxos	Greece	AIRPORT	GRJNX
Nawab Shah	Pakistan	AIRPORT	PKWNS
Natal	Brazil	AIRPORT	BRNAT
Nassau	Bahamas	AIRPORT	BSNAS
Nashville (TN)	USA	AIRPORT	USBNA
Narsarsuaq	Greenland	AIRPORT	GLUAK
Narrandera	Australia	AIRPORT	AUNRA
Narrabri	Australia	AIRPORT	AUNAA
Naples	Italy	AIRPORT	ITNAP
Naples (FL)	USA	AIRPORT	USAPF
Nantucket (MA)	USA	AIRPORT	USACK
Nantes	France	AIRPORT	FRNTE
Nanisivik	Canada	AIRPORT	CAYSR
Nancy	France	AIRPORT	FRENC
Nakhon Si Thammarat	Thailand	AIRPORT	THNST
Nakhichevan	Azerbaijan	AIRPORT	AZNAJ
Nairobi	Kenya	AIRPORT	KENBO
Nagpur	India	AIRPORT	INNAG
Nagoya	Japan	AIRPORT	JPNGO
Nagasaki	Japan	AIRPORT	JPNGS
Nadi	Fiji	AIRPORT	FJNAN
Mzamba	South Africa	AIRPORT	ZAMZF
Mytilene (Lesbos)	Greece	AIRPORT	GRMJT
Mysore	India	AIRPORT	INMYQ
Myrtle Beach (SC)	USA	AIRPORT	USMYR
Mykonos	Greece	AIRPORT	GRJMK
Mvengue	Gabon	AIRPORT	GAMVB
Muzaffarabad	Pakistan	AIRPORT	PKMFG
Muskegon (MI)	USA	AIRPORT	USMKG
Muscle Shoals (AL)	USA	AIRPORT	USMSL
Muscat	Oman	AIRPORT	OMMCT
Mus	Turkey	AIRPORT	TRMSR
Murmansk	Russia	AIRPORT	RUMMK
Murcia	Spain	AIRPORT	ESMJV
Multan	Pakistan	AIRPORT	PKMUX
Mulhouse	France	AIRPORT	FRMLH
Muenster/Osnabrueck	Germany	AIRPORT	DEFMO
Muenchen (Munich)	Germany	AIRPORT	DEMUC
Mt. McKinley (AK)	USA	AIRPORT	USMCL
Mt. Isa	Australia	AIRPORT	AUISA
Mount Magnet	Australia	AIRPORT	AUMMG
Mount Gambier	Australia	AIRPORT	AUMGB
Mount Cook	New Zealand	AIRPORT	NZGTN
Moundou	Chad	AIRPORT	TDMQQ
Mouila	Gabon	AIRPORT	GAMJL
Mosul	Iraq	AIRPORT	IQOSM
Mostar	Bosnia and Herzegovina	AIRPORT	BAOMO
Mossel Bay	South Africa	AIRPORT	ZAMZY
Moses Lake (WA)	USA	AIRPORT	USMWH
Moscow	Russia	AIRPORT	RUVKO
Moruya	Australia	AIRPORT	AUMYA
Morioka, Hanamaki	Japan	AIRPORT	JPHNA
Morgantown (WV)	USA	AIRPORT	USMGW
Morelia	Mexico	AIRPORT	MXMLM
Moree	Australia	AIRPORT	AUMRZ
Moranbah	Australia	AIRPORT	AUMOV
Moorea	French Polynesia	AIRPORT	PFMOZ
Montrose/Tellruide (CO)	USA	AIRPORT	USMTJ
Montreal	Canada	AIRPORT	CAYMX
Montpellier	France	AIRPORT	FRMPL
Montgomery (AL)	USA	AIRPORT	USMGM
Montevideo	Uruguay	AIRPORT	UYMVD
Monterrey	Mexico	AIRPORT	MXMTY
Monterey (CA)	USA	AIRPORT	USMRY
Montenegro	Brazil	AIRPORT	BRQGF
Montego Bay	Jamaica	AIRPORT	JMMBJ
Monrovia	Liberia	AIRPORT	LRROB
Monroe (LA)	USA	AIRPORT	USMLU
Moncton	Canada	AIRPORT	CAYQM
Monastir	Tunisia	AIRPORT	TNMIR
Mombasa	Kenya	AIRPORT	KEMBA
Moline/Quad Cities (IL)	USA	AIRPORT	USMLI
Mokuti	Namibia	AIRPORT	NAOKU
Mogadishu	Somalia	AIRPORT	SOMGQ
Moenjodaro	Pakistan	AIRPORT	PKMJD
Modesto (CA)	USA	AIRPORT	USMOD
Mobile (AL)	USA	AIRPORT	USMOB
Moanda	Gabon	AIRPORT	GAMFF
Mkambati	South Africa	AIRPORT	ZAMBM
Miyazaki	Japan	AIRPORT	JPKMI
Miyako Jima (Ryuku Islands)	Japan	AIRPORT	JPMMY
Mitchell (SD)	USA	AIRPORT	USMHE
Missula (MT)	USA	AIRPORT	USMSO
Mirpur	Pakistan	AIRPORT	PKQML
Miri	Malaysia	AIRPORT	MYMYY
Minsk, International	Belarus	AIRPORT	BYMSQ
Minot (ND)	USA	AIRPORT	USMOT
Minneapolis	USA	AIRPORT	USMSP
Mineralnye Vody	Russia	AIRPORT	RUMRV
Minatitlan	Mexico	AIRPORT	MXMTT
Milwaukee (WI)	USA	AIRPORT	USMKE
Milford Sound	New Zealand	AIRPORT	NZMFN
Miles City (MT)	USA	AIRPORT	USMLS
Mildura	Australia	AIRPORT	AUMQL
Milan	Italy	AIRPORT	ITBGY
Mikkeli	Finland	AIRPORT	FIMIK
Midland/Odessa (TX)	USA	AIRPORT	USMAF
Middlemount	Australia	AIRPORT	AUMMM
Mianwali	Pakistan	AIRPORT	PKMWD
Miami (FL)	USA	AIRPORT	USMIA
Mfuwe	Zambia	AIRPORT	ZMMFU
Mexico City	Mexico	AIRPORT	MXNLU
Mexicali	Mexico	AIRPORT	MXMXL
Metz/Nancy Metz	France	AIRPORT	FRETZ
Metz	France	AIRPORT	FRMZM
Metlakatla (AK)	USA	AIRPORT	USMTM
Messina	South Africa	AIRPORT	ZAMEZ
Merimbula	Australia	AIRPORT	AUMIM
Meridian (MS)	USA	AIRPORT	USMEI
Merida	Mexico	AIRPORT	MXMID
Merced (CA)	USA	AIRPORT	USMCE
Mendoza	Argentina	AIRPORT	ARMDZ
Memphis (TN)	USA	AIRPORT	USMEM
Melville Hall	Dominica	AIRPORT	DMDOM
Melbourne	Australia	AIRPORT	AUMEL
Melbourne (FL)	USA	AIRPORT	USMLB
Meekatharra	Australia	AIRPORT	AUMKR
Medina	Saudi Arabia	AIRPORT	SAMED
Medford (OR)	USA	AIRPORT	USMFR
Medellin	Colombia	AIRPORT	COMDE
Medan	Indonesia	AIRPORT	IDMES
McAllen (TX)	USA	AIRPORT	USMFE
Mazatlan	Mexico	AIRPORT	MXMZT
Mayaguez	Puerto Rico	AIRPORT	PRMAZ
Mauritius	Mauritius	AIRPORT	MUMRU
Maupiti	French Polynesia	AIRPORT	PFMAU
Maun	Botswana	AIRPORT	BWMUB
Mattoon (IL)	USA	AIRPORT	USMTO
Matsuyama	Japan	AIRPORT	JPMYJ
Matsumoto, Nagano	Japan	AIRPORT	JPMMJ
Masvingo	Zimbabwe	AIRPORT	ZWMVZ
Mason City IA	USA	AIRPORT	USMCW
Maseru	Lesotho	AIRPORT	LSMSU
Maryborough	Australia	AIRPORT	AUMBH
Martinsburg (WV)	USA	AIRPORT	USMRB
Martha's Vineyard (MA)	USA	AIRPORT	USMVY
Marsh Harbour	Bahamas	AIRPORT	BSMHH
Marseille	France	AIRPORT	FRMRS
Marsa Matrah (Marsa Matruh)	Egypt	AIRPORT	EGMUH
Marsa Alam	Egypt	AIRPORT	EGRMF
Marrakesh	Morocco	AIRPORT	MARAK
Marquette (MI)	USA	AIRPORT	USMQT
Maroua	Cameroon	AIRPORT	CMMVR
Mariehamn (Maarianhamina)	Finland	AIRPORT	FIMHQ
Maribor	Slovenia	AIRPORT	SIMBX
Margerita	Venezuela	AIRPORT	VEPMV
Margate	South Africa	AIRPORT	ZAMGH
Mare	New Caledonia	AIRPORT	NCMEE
Mardin	Turkey	AIRPORT	TRMQM
Marathon (FL)	USA	AIRPORT	USMTH
Maras	Turkey	AIRPORT	TRKCM
Maradi	Niger	AIRPORT	NEMFQ
Maracaibo	Venezuela	AIRPORT	VEMAR
Mar del Plata	Argentina	AIRPORT	ARMDQ
Maputo	Mozambique	AIRPORT	MZMPM
Manzini	Swaziland	AIRPORT	SZMTS
Manzanillo	Mexico	AIRPORT	MXZLO
Manihi	French Polynesia	AIRPORT	PFXMH
Manguna	Papua New Guinea	AIRPORT	PGMFO
Mandalay	Myanmar	AIRPORT	MMMDL
Manchester (NH)	USA	AIRPORT	USMHT
Manchester	United Kingdom	AIRPORT	GBMAN
Manaus	Brazil	AIRPORT	BRMAO
Managua	Nicaragua	AIRPORT	NIMGA
Manado	Indonesia	AIRPORT	IDMDC
Malmo (Malmoe)	Sweden	AIRPORT	SEMMA
Malmo (Malmö)	Sweden	AIRPORT	SEMMX
Malindi	Kenya	AIRPORT	KEMYD
Malatya	Turkey	AIRPORT	TRMLX
Malaga	Spain	AIRPORT	ESAGP
Malabo	Equatorial Guinea	AIRPORT	GQSSG
Makung	Taiwan	AIRPORT	TWMZG
Majunga	Madagascar	AIRPORT	MGMJN
Maitland	Australia	AIRPORT	AUMTL
Mahon	Spain	AIRPORT	ESMAH
Mahe	Seychelles	AIRPORT	SCSEZ
Madrid	Spain	AIRPORT	ESMAD
Madras (Chennai)	India	AIRPORT	INMAA
Madison (WI)	USA	AIRPORT	USMSN
Madinah (Medina)	Saudi Arabia	AIRPORT	SAMED
Mactan Island	Philippines	AIRPORT	PHNOP
Macon (GA)	USA	AIRPORT	USMCN
Mackay	Australia	AIRPORT	AUMKY
Maceio	Brazil	AIRPORT	BRMCZ
Macapa	Brazil	AIRPORT	BRMCP
Maastricht/Aachen	Netherlands	AIRPORT	NLMST
Lyons (KS)	USA	AIRPORT	USLYO
Lyon	France	AIRPORT	FRLYS
Lynchburg (VA)	USA	AIRPORT	USLYH
Lydd	United Kingdom	AIRPORT	GBLYX
Lvov (Lwow, Lemberg)	Ukraine	AIRPORT	UALWO
Luxor	Egypt	AIRPORT	EGLXR
Luxembourg	Luxembourg	AIRPORT	LULUX
Lusisiki	South Africa	AIRPORT	ZALUJ
Lusaka	Zambia	AIRPORT	ZMLUN
Lulea	Sweden	AIRPORT	SELLA
Lugano	Switzerland	AIRPORT	CHLUG
Luga	Malta	AIRPORT	MTMLA
Luederitz	Namibia	AIRPORT	NALUD
Lucknow	India	AIRPORT	INLKO
Lubbock (TX)	USA	AIRPORT	USLBB
Luanda	Angola	AIRPORT	AOLAD
Lourdes/Tarbes	France	AIRPORT	FRLDE
Louisville (KY)	USA	AIRPORT	USSDF
Los Mochis	Mexico	AIRPORT	MXLMM
Los Cabos	Mexico	AIRPORT	MXSJD
Los Angeles (CA)	USA	AIRPORT	USLAX
Lorient	France	AIRPORT	FRLRT
Loreto	Mexico	AIRPORT	MXLTO
Longview/Kilgore (TX)	USA	AIRPORT	USGGG
Longreach	Australia	AIRPORT	AULRE
Long Island, Islip (NY)	USA	AIRPORT	USISP
Long Island (AK)	USA	AIRPORT	USLIJ
Long Beach (CA)	USA	AIRPORT	USLGB
Londonderry	United Kingdom	AIRPORT	GBLDY
London Metropolitan Area	United Kingdom	AIRPORT	GBLON
London	Canada	AIRPORT	CAYXU
Lome	Togo	AIRPORT	TGLFW
Lockhart River	Australia	AIRPORT	AUIRG
Ljubljana	Slovenia	AIRPORT	SILJU
Lizard Island	Australia	AIRPORT	AULZR
Liverpool	United Kingdom	AIRPORT	GBLPL
Little Rock (AR)	USA	AIRPORT	USLIT
Lismore	Australia	AIRPORT	AULSY
Lisbon	Portugal	AIRPORT	PTLIS
Linz	Austria	AIRPORT	ATLNZ
Lindeman Island	Australia	AIRPORT	AULDC
Lincoln (NE)	USA	AIRPORT	USLNK
Limoges	France	AIRPORT	FRLIG
Limassol	Cyprus	AIRPORT	CYQLI
Lima	Peru	AIRPORT	PELIM
Lilongwe	Malawi	AIRPORT	MWLLW
Lille	France	AIRPORT	FRLIL
Lihue (HI)	USA	AIRPORT	USLIH
Liege	Belgium	AIRPORT	BELGG
Lidkoeping	Sweden	AIRPORT	SELDK
Libreville	Gabon	AIRPORT	GALBV
Lexington (KY)	USA	AIRPORT	USLEX
Lewistown (MT)	USA	AIRPORT	USLWT
Lewiston (ID)	USA	AIRPORT	USLWS
Lerwick/Tingwall (Shetland Islands)	United Kingdom	AIRPORT	GBLWK
Leonora	Australia	AIRPORT	AULNO
Leon	Mexico	AIRPORT	MXBJX
Lelystad	Netherlands	AIRPORT	NLLEY
Leipzig	Germany	AIRPORT	DELEJ
Leinster	Australia	AIRPORT	AULER
Leeds/Bradford	United Kingdom	AIRPORT	GBLBA
Lebanon (NH)	USA	AIRPORT	USLEB
Learmouth (Exmouth)	Australia	AIRPORT	AULEA
Leaf Rapids	Canada	AIRPORT	CAYLR
Lazaro Cardenas	Mexico	AIRPORT	MXLZC
Lawton (OK)	USA	AIRPORT	USLAW
Laverton	Australia	AIRPORT	AULVO
Laurel/Hattisburg (MS)	USA	AIRPORT	USPIB
Launceston	Australia	AIRPORT	AULST
Latrobe (PA)	USA	AIRPORT	USLBE
Las Vegas (NV)	USA	AIRPORT	USLAS
Las Palmas	Spain	AIRPORT	ESLPA
Larnaca	Cyprus	AIRPORT	CYLCA
Laredo (TX)	USA	AIRPORT	USLRD
Laramie (WY)	USA	AIRPORT	USLAR
Lappeenranta	Finland	AIRPORT	FILPP
Lansing (MI)	USA	AIRPORT	USLAN
Lanseria	South Africa	AIRPORT	ZAHLA
Lannion	France	AIRPORT	FRLAI
Langkawi (islands)	Malaysia	AIRPORT	MYLGK
Land's End	United Kingdom	AIRPORT	GBLEQ
Lancaster (PA)	USA	AIRPORT	USLNS
Lanai City (HI)	USA	AIRPORT	USLNY
Lampedusa	Italy	AIRPORT	ITLMP
Lamezia Terme	Italy	AIRPORT	ITSUF
Lambarene	Gabon	AIRPORT	GALBQ
Lakselv	Norway	AIRPORT	NOLKL
Lake Tahoe (CA)	USA	AIRPORT	USTVL
Lake Havasu City (AZ)	USA	AIRPORT	USHII
Lake Charles (LA)	USA	AIRPORT	USLCH
Lahore	Pakistan	AIRPORT	PKLHE
Lagos	Nigeria	AIRPORT	NGLOS
Lafayette, La	USA	AIRPORT	USLFT
Lafayette (IN)	USA	AIRPORT	USLAF
Lae	Papua New Guinea	AIRPORT	PGLAE
Lac Brochet, MB	Canada	AIRPORT	CAXLB
Labuan	Malaysia	AIRPORT	MYLBU
Labouchere Bay (AK)	USA	AIRPORT	USWLB
Labe	Guinea	AIRPORT	GNLEK
La Rochelle	France	AIRPORT	FRLRH
La Paz	Bolivia	AIRPORT	BOLPB
La Paz	Mexico	AIRPORT	MXLAP
La Grande	Canada	AIRPORT	CAYGL
La Crosse (WI)	USA	AIRPORT	USLSE
La Coruna	Spain	AIRPORT	ESLCG
Kyoto	Japan	AIRPORT	JPUKY
Kuwait	Kuwait	AIRPORT	KWKWI
Kuusamo	Finland	AIRPORT	FIKAO
Kuujjuarapik	Canada	AIRPORT	CAYGW
Kuujjuaq (FortChimo)	Canada	AIRPORT	CAYVP
Kushiro	Japan	AIRPORT	JPKUH
Kuopio	Finland	AIRPORT	FIKUO
Kununurra	Australia	AIRPORT	AUKNX
Kumamoto	Japan	AIRPORT	JPKMJ
Kuching	Malaysia	AIRPORT	MYKCH
Kuantan	Malaysia	AIRPORT	MYKUA
Kuala Lumpur	Malaysia	AIRPORT	MYSZB
Kristiansund	Norway	AIRPORT	NOKSU
Kristianstad	Sweden	AIRPORT	SEKID
Kristiansand	Norway	AIRPORT	NOKRS
Krakow (Cracow)	Poland	AIRPORT	PLKRK
Kowanyama	Australia	AIRPORT	AUKWM
Kotzbue (AK)	USA	AIRPORT	USOTZ
Kota Kinabalu	Malaysia	AIRPORT	MYBKI
Kos	Greece	AIRPORT	GRKGS
Konya	Turkey	AIRPORT	TRKYA
Kona (HI)	USA	AIRPORT	USKOA
Komatsu	Japan	AIRPORT	JPKMQ
Köln, Köln/Bonn	Germany	AIRPORT	DECGN
Kolkata (Calcutta)	India	AIRPORT	INCCU
Kokkola/Pietarsaari	Finland	AIRPORT	FIKOK
Kohat	Pakistan	AIRPORT	PKOHT
Kodiak (AK)	USA	AIRPORT	USADQ
Kochi	Japan	AIRPORT	JPKCZ
Kobe	Japan	AIRPORT	JPUKB
Knoxville (TN)	USA	AIRPORT	USTYS
Knock	Ireland	AIRPORT	IENOC
Kleinsee	South Africa	AIRPORT	ZAKLZ
Klawock (AK)	USA	AIRPORT	USKLW
Klamath Fall (OR)	USA	AIRPORT	USLMT
Klagenfurt	Austria	AIRPORT	ATKLU
Kitwe	Zambia	AIRPORT	ZMKIW
Kittilä	Finland	AIRPORT	FIKTT
Kiruna	Sweden	AIRPORT	SEKRN
Kirkwall (Orkney)	United Kingdom	AIRPORT	GBKOI
Kirkuk	Iraq	AIRPORT	IQKIK
Kirkenes	Norway	AIRPORT	NOKKN
Kiritimati (island)	Kiribati	AIRPORT	KICXI
Kingstown	Saint Vincent and the Grenadines	AIRPORT	VCSVD
Kingston	Jamaica	AIRPORT	JMKIN
Kingston (NC)	USA	AIRPORT	USISO
Kingscote	Australia	AIRPORT	AUKGC
King Salomon (AK)	USA	AIRPORT	USAKN
Kimberley	South Africa	AIRPORT	ZAKIM
Killeem (TX)	USA	AIRPORT	USILE
Kilimadjaro	Tanzania	AIRPORT	TZJRO
Kigali	Rwanda	AIRPORT	RWKGL
Kiev	Ukraine	AIRPORT	UAIEV
Kiel	Germany	AIRPORT	DEKEL
Khuzdar	Pakistan	AIRPORT	PKKDD
Khartoum	Sudan	AIRPORT	SDKRT
Kharkov	Ukraine	AIRPORT	UAHRK
Kharga	Egypt	AIRPORT	EGUVL
Khamis Mushayat	Saudi Arabia	AIRPORT	SAAHB
Key West (FL)	USA	AIRPORT	USEYW
Ketchikan (AK)	USA	AIRPORT	USKTN
Kerry County	Ireland	AIRPORT	IEKIR
Kent (Manston) Kent International	United Kingdom	AIRPORT	GBMSE
Kenai (AK)	USA	AIRPORT	USENA
Kemi/Tornio	Finland	AIRPORT	FIKEM
Kelowna, BC	Canada	AIRPORT	CAYLW
Keetmanshoop	Namibia	AIRPORT	NAKMP
Kazan	Russia	AIRPORT	RUKZN
Kayseri	Turkey	AIRPORT	TRASR
Kavalla	Greece	AIRPORT	GRKVA
Kaunakakai (HI)	USA	AIRPORT	USMKK
Kauhajoki	Finland	AIRPORT	FIKHJ
Katima Mulilo/Mpacha	Namibia	AIRPORT	NAMPA
Kathmandu	Nepal	AIRPORT	NPKTM
Katherine	Australia	AIRPORT	AUKTR
Kassala	Sudan	AIRPORT	SDKSL
Kaschechawan, PQ	Canada	AIRPORT	CAZKE
Karup	Denmark	AIRPORT	DKKRP
Karumba	Australia	AIRPORT	AUKRB
Kars	Turkey	AIRPORT	TRKYS
Karratha	Australia	AIRPORT	AUKTA
Karpathos	Greece	AIRPORT	GRAOK
Karlstad	Sweden	AIRPORT	SEKSD
Karlsruhe	Germany	AIRPORT	DEFKB
Karachi	Pakistan	AIRPORT	PKKHI
Kapalua West (HI)	USA	AIRPORT	USJHM
Kaohsiung International	Taiwan	AIRPORT	TWKHH
Kansas City (MO)	USA	AIRPORT	USMCI
Kanpur	India	AIRPORT	INKNU
Kano	Nigeria	AIRPORT	NGKAN
Kamuela (HI)	USA	AIRPORT	USMUE
Kamloops, BC	Canada	AIRPORT	CAYKA
Kalmar	Sweden	AIRPORT	SEKLR
Kalispell (MT)	USA	AIRPORT	USFCA
Kaliningrad	Russia	AIRPORT	RUKGD
Kalgoorlie	Australia	AIRPORT	AUKGI
Kalamazoo/Battle Creek (MI)	USA	AIRPORT	USAZO
Kalamata	Greece	AIRPORT	GRKLX
Kajaani	Finland	AIRPORT	FIKAJ
Kahului (HI)	USA	AIRPORT	USOGG
Kahramanmaras	Turkey	AIRPORT	TRKCM
Kagoshima	Japan	AIRPORT	JPKOJ
Kabul	Afghanistan	AIRPORT	AFKBL
Jyväskylä (Jyvaskyla)	Finland	AIRPORT	FIJYV
Jwaneng	Botswana	AIRPORT	BWJWA
Juticalpa	Honduras	AIRPORT	HNJUT
Junin	Argentina	AIRPORT	ARJNI
Juneau (AK)	USA	AIRPORT	USJNU
Jundah	Australia	AIRPORT	AUJUN
Jumla	Nepal	AIRPORT	NPJUM
Juliaca	Peru	AIRPORT	PEJUL
Julia Creek	Australia	AIRPORT	AUJCK
Jujuy	Argentina	AIRPORT	ARJUJ
Juiz De Fora	Brazil	AIRPORT	BRJDF
Juist (island)	Germany	AIRPORT	DEJUI
Juba	South Sudan	AIRPORT	SSJUB
Juanjui	Peru	AIRPORT	PEJJI
Jouf	Saudi Arabia	AIRPORT	SAAJF
Jose De San Martin	Argentina	AIRPORT	ARJSM
Jos	Nigeria	AIRPORT	NGJOS
Jorhat	India	AIRPORT	INJRH
Joplin (MO)	USA	AIRPORT	USJLN
Jönköping (Jonkoping)	Sweden	AIRPORT	SEJKG
Jonesboro	USA	AIRPORT	USJBR
Jomsom	Nepal	AIRPORT	NPJMO
Jolo	Philippines	AIRPORT	PHJOL
Joinville	Brazil	AIRPORT	BRJOI
Johor Bahru	Malaysia	AIRPORT	MYJHB
Johnstown (PA)	USA	AIRPORT	USJST
Johnston Island	USA	AIRPORT	USJON
Johnson City (NY)	USA	AIRPORT	USBGM
Johannesburg	South Africa	AIRPORT	ZAJNB
Joensuu	Finland	AIRPORT	FIJOE
Jodhpur	India	AIRPORT	INJDH
Joao Pessoa	Brazil	AIRPORT	BRJPA
Joacaba	Brazil	AIRPORT	BRJCB
Jiwani	Pakistan	AIRPORT	PKJIW
Jiri	Nepal	AIRPORT	NPJIR
Jipijapa	Ecuador	AIRPORT	ECJIP
Jinka	Ethiopia	AIRPORT	ETBCO
Jinja	Uganda	AIRPORT	UGJIN
Jimma	Ethiopia	AIRPORT	ETJIM
Jijiga	Ethiopia	AIRPORT	ETJIJ
Jijel	Algeria	AIRPORT	DZGJL
Jeypore	India	AIRPORT	INPYB
Jessore	Bangladesh	AIRPORT	BDJSR
Jerusalem	Israel	AIRPORT	ILJRS
Jerez de la Frontera/Cadiz	Spain	AIRPORT	ESXRY
Jeremie	Haiti	AIRPORT	HTJEE
Jefferson City (MO)	USA	AIRPORT	USJEF
Jeddah	Saudi Arabia	AIRPORT	SAJED
Jayapura	Indonesia	AIRPORT	IDDJJ
Jauja	Peru	AIRPORT	PEJAU
Jatai	Brazil	AIRPORT	BRJTI
Jaque	Panama	AIRPORT	PAJQE
Januaria	Brazil	AIRPORT	BRJNA
Janesville (WI)	USA	AIRPORT	USJVL
Jandakot	Australia	AIRPORT	AUJAD
Janakpur	Nepal	AIRPORT	NPJKR
Jamshedpur	India	AIRPORT	INIXW
Jamnagar	India	AIRPORT	INJGA
Jammu	India	AIRPORT	INIXJ
Jamestown (NY)	USA	AIRPORT	USJHW
Jamestown (ND)	USA	AIRPORT	USJMS
Jambol	Bulgaria	AIRPORT	BGJAM
Jamba	Angola	AIRPORT	AOJMB
Jaluit Island	Marshall Islands	AIRPORT	MHUIT
Jales	Brazil	AIRPORT	BRJLS
Jalapa	Mexico	AIRPORT	MXJAL
Jalandhar	India	AIRPORT	INJLR
Jalalabad	Afghanistan	AIRPORT	AFJAA
Jakarta	Indonesia	AIRPORT	IDCGK
Jaisalmer	India	AIRPORT	INJSA
Jaipur	India	AIRPORT	INJAI
Jagdalpur	India	AIRPORT	INJGB
Jaffna	Sri Lanka	AIRPORT	LKJAF
Jacquinot Bay	Papua New Guinea	AIRPORT	PGJAQ
Jacobina	Brazil	AIRPORT	BRJCM
Jacobabad	Pakistan	AIRPORT	PKJAG
Jacmel	Haiti	AIRPORT	HTJAK
Jacksonville (FL) Jacksonville NAS	USA	AIRPORT	USNIP
Jacksonville (FL)	USA	AIRPORT	USJAX
Jacksonville (TX)	USA	AIRPORT	USJKV
Jacksonville (NC)	USA	AIRPORT	USOAJ
Jacksonville (IL)	USA	AIRPORT	USIJX
Jacksonville (AR) Little Rock AFB	USA	AIRPORT	USLRF
Jackson, MN	USA	AIRPORT	USMJQ
Jackson (MS)	USA	AIRPORT	USJAN
Jackson Hole (WY)	USA	AIRPORT	USJAC
Jackson (TN)	USA	AIRPORT	USMKL
Jackson (MI)	USA	AIRPORT	USJXN
Izmir	Turkey	AIRPORT	TRADB
Ixtapa/Zihuatenejo	Mexico	AIRPORT	MXZIH
Ivalo	Finland	AIRPORT	FIIVL
Ithaca/Cortland (NY)	USA	AIRPORT	USITH
Istanbul	Turkey	AIRPORT	TRSAW
Islay	United Kingdom	AIRPORT	GBILY
Islamabad	Pakistan	AIRPORT	PKISB
Ishigaki	Japan	AIRPORT	JPISG
Irkutsk	Russia	AIRPORT	RUIKT
Iquitos	Peru	AIRPORT	PEIQT
Iqaluit (Frobisher Bay)	Canada	AIRPORT	CAYFB
Inykern (CA)	USA	AIRPORT	USIYK
Inverness	United Kingdom	AIRPORT	GBINV
Invercargill	New Zealand	AIRPORT	NZIVC
Inuvik	Canada	AIRPORT	CAYEV
International Falls (MN)	USA	AIRPORT	USINL
Innsbruck	Austria	AIRPORT	ATINN
Innisfail	Australia	AIRPORT	AUIFL
Ingham	Australia	AIRPORT	AUIGH
Indianapolis (IN) International	USA	AIRPORT	USIND
Incercargill	New Zealand	AIRPORT	NZIVC
Imperial (CA)	USA	AIRPORT	USIPL
Iliamna (AK)	USA	AIRPORT	USILI
Ile Ouen	New Caledonia	AIRPORT	NCIOU
Ile des Pins	New Caledonia	AIRPORT	NCILP
Iguazu, Cataratas	Argentina	AIRPORT	ARIGR
Idaho Falls (ID)	USA	AIRPORT	USIDA
Hyderabad	India	AIRPORT	INHYD
Hyderabad	Pakistan	AIRPORT	PKHDD
Hydaburg (AK)	USA	AIRPORT	USHYG
Hyannis (MA)	USA	AIRPORT	USHYA
Hwange National Park	Zimbabwe	AIRPORT	ZWHWN
Huron (SD)	USA	AIRPORT	USHON
Hurghada International	Egypt	AIRPORT	EGHRG
Huntsville (AL)	USA	AIRPORT	USHSV
Huntington (WV)	USA	AIRPORT	USHTS
Humberside	United Kingdom	AIRPORT	GBHUY
Huatulco	Mexico	AIRPORT	MXHUX
Huahine	French Polynesia	AIRPORT	PFHUH
Houston, TX	USA	AIRPORT	USIAH
Houston (TX) , Hobby	USA	AIRPORT	USHOU
Horta	Portugal	AIRPORT	PTHOR
Hoonah (AK)	USA	AIRPORT	USHNH
Honolulu (HI)	USA	AIRPORT	USHNL
Honiara Henderson International	Solomon Islands	AIRPORT	SBHIR
Hong Kong	Hong Kong	AIRPORT	HKHKG
Homer (AK)	USA	AIRPORT	USHOM
Home Hill	Australia	AIRPORT	AUHMH
Holguin	Cuba	AIRPORT	CUHOG
Hof	Germany	AIRPORT	DEHOQ
Hobart	Australia	AIRPORT	AUHBA
Hiroshima International	Japan	AIRPORT	JPHIJ
Hinchinbrook Island	Australia	AIRPORT	AUHNK
Hilton Head Island (SC)	USA	AIRPORT	USHHH
Hilo (HI)	USA	AIRPORT	USITO
Hickory (NC)	USA	AIRPORT	USHKY
Hibbing (MN)	USA	AIRPORT	USHIB
Hervey Bay	Australia	AIRPORT	AUHVB
Hermosillo	Mexico	AIRPORT	MXHMO
Heraklion	Greece	AIRPORT	GRHER
Helsinki	Finland	AIRPORT	FIHEL
Helsingborg	Sweden	AIRPORT	SEJHE
Helena (MT)	USA	AIRPORT	USHLN
Hayman Island	Australia	AIRPORT	AUHIS
Havre (MT)	USA	AIRPORT	USHVR
Havana	Cuba	AIRPORT	CUHAV
Haugesund	Norway	AIRPORT	NOHAU
Hatyai (Hat Yai)	Thailand	AIRPORT	THHDY
Hartford (CT) /Springfield (MA)	USA	AIRPORT	USBDL
Harrisburg (PA)	USA	AIRPORT	USHAR
Harrington Harbour, PQ	Canada	AIRPORT	CAYHR
Harlingen/South Padre Island (TX)	USA	AIRPORT	USHRL
Harare	Zimbabwe	AIRPORT	ZWHRE
Hanoi	Vietnam	AIRPORT	VNHAN
Hannover	Germany	AIRPORT	DEHAJ
Hancock (MI)	USA	AIRPORT	USCMX
Hammerfest	Norway	AIRPORT	NOHFT
Hamilton Island	Australia	AIRPORT	AUHTI
Hamilton	New Zealand	AIRPORT	NZHLZ
Hamilton	Canada	AIRPORT	CAYHM
Hamilton	Australia	AIRPORT	AUHLT
Hamburg	Germany	AIRPORT	DEHAM
Hall Beach	Canada	AIRPORT	CAYUX
Halifax International	Canada	AIRPORT	CAYHZ
Hakodate	Japan	AIRPORT	JPHKD
Haines (AK)	USA	AIRPORT	USHNS
Haifa	Israel	AIRPORT	ILHFA
Hagåtña	Guam	AIRPORT	GUGUM
Hachijo Jima	Japan	AIRPORT	JPHAC
Gympie	Australia	AIRPORT	AUGYP
Gweru	Zimbabwe	AIRPORT	ZWGWE
Gwadar	Pakistan	AIRPORT	PKGWD
Guwahati	India	AIRPORT	INGAU
Gunnison/Crested Butte (CO)	USA	AIRPORT	USGUC
Gulu	Uganda	AIRPORT	UGULU
Gulfport/Biloxi (MS)	USA	AIRPORT	USGPT
Guettin	Germany	AIRPORT	DEGTI
Guayaquil	Ecuador	AIRPORT	ECGYE
Guatemala City	Guatemala	AIRPORT	GTGUA
Guam	Guam	AIRPORT	GUGUM
Guadalcanal	Solomon Islands	AIRPORT	SBGSI
Guadalajara	Mexico	AIRPORT	MXGDL
Groton/New London (CT)	USA	AIRPORT	USGON
Groote Eylandt	Australia	AIRPORT	AUGTE
Groningen	Netherlands	AIRPORT	NLGRQ
Griffith	Australia	AIRPORT	AUGFF
Grenoble	France	AIRPORT	FRGNB
Grenada	Grenada	AIRPORT	GDGND
Greenville/Spartanburg (SC)	USA	AIRPORT	USGSP
Greenville (NC)	USA	AIRPORT	USPGV
Greenville (MS)	USA	AIRPORT	USGLH
Greensboro/Winston Salem (NC)	USA	AIRPORT	USGSO
Greenbrier/Lewisburg (WV)	USA	AIRPORT	USLWB
Green Bay (WI)	USA	AIRPORT	USGRB
Great Keppel Island	Australia	AIRPORT	AUGKL
Great Falls (MT)	USA	AIRPORT	USGTF
Graz	Austria	AIRPORT	ATGRZ
Grand Rapids (MN)	USA	AIRPORT	USGPZ
Grand Rapids (MI)	USA	AIRPORT	USGRR
Grand Junction (CO)	USA	AIRPORT	USGJT
Grand Forks (ND)	USA	AIRPORT	USGFK
Grand Cayman	Cayman Islands	AIRPORT	KYGCM
Grand Canyon (AZ)	USA	AIRPORT	USGCN
Grand Bahama International	Bahamas	AIRPORT	BSFPO
Granada	Spain	AIRPORT	ESGRX
Govenors Harbour	Bahamas	AIRPORT	BSGHB
Gove (Nhulunbuy)	Australia	AIRPORT	AUGOV
Gothenburg (Göteborg)	Sweden	AIRPORT	SEGOT
Gorna	Bulgaria	AIRPORT	BGGOZ
Goose Bay	Canada	AIRPORT	CAYYR
Goondiwindi	Australia	AIRPORT	AUGOO
Gold Coast	Australia	AIRPORT	AUOOL
Goiania	Brazil	AIRPORT	BRGYN
Goa	India	AIRPORT	INGOI
Glendive (MT)	USA	AIRPORT	USGDV
Glasgow, Prestwick	United Kingdom	AIRPORT	GBPIK
Glasgow (MT)	USA	AIRPORT	USGGW
Glasgow	United Kingdom	AIRPORT	GBGLA
Gladstone	Australia	AIRPORT	AUGLT
Gillam	Canada	AIRPORT	CAYGX
Gilgit	Pakistan	AIRPORT	PKGIL
Gilette (WY)	USA	AIRPORT	USGCC
Gibraltar	Gibraltar	AIRPORT	GIGIB
Ghent (Gent)	Belgium	AIRPORT	BEGNE
Gerona	Spain	AIRPORT	ESGRO
Geraldton	Australia	AIRPORT	AUGET
Georgetown	Guyana	AIRPORT	GYGEO
George	South Africa	AIRPORT	ZAGRJ
Genoa	Italy	AIRPORT	ITGOA
Geneva	Switzerland	AIRPORT	CHGVA
Geelong	Australia	AIRPORT	AUGEX
Gdansk	Poland	AIRPORT	PLGDN
Gaziantep	Turkey	AIRPORT	TRGZT
Garoua	Cameroon	AIRPORT	CMGOU
Gander	Canada	AIRPORT	CAYQX
Galway	Ireland	AIRPORT	IEGWY
Gainesville (FL)	USA	AIRPORT	USGNV
Gadsden (AL)	USA	AIRPORT	USGAD
Gaborone	Botswana	AIRPORT	BWGBE
Funchal	Portugal	AIRPORT	PTFNC
Fukushima	Japan	AIRPORT	JPFKS
Fukuoka	Japan	AIRPORT	JPFUK
Fujairah	United Arab Emirates	AIRPORT	AEFJR
Fuerteventura	Spain	AIRPORT	ESFUE
Friedrichshafen	Germany	AIRPORT	DEFDH
Fresno (CA)	USA	AIRPORT	USFAT
Frejus	France	AIRPORT	FRFRJ
Freetown	Sierra Leone	AIRPORT	SLFNA
Freeport	Bahamas	AIRPORT	BSFPO
Fredericton	Canada	AIRPORT	CAYFC
Franklin/Oil City (PA)	USA	AIRPORT	USFKL
Frankfurt/Main	Germany	AIRPORT	DEFRA
Frankfurt/Hahn	Germany	AIRPORT	DEHHN
Francistown	Botswana	AIRPORT	BWFRW
Foula (Shetland)	United Kingdom	AIRPORT	GBFOU
Fortaleza	Brazil	AIRPORT	BRFOR
Fort Worth (TX)	USA	AIRPORT	USDFW
Fort Wayne (IN)	USA	AIRPORT	USFWA
Fort Walton Beach (FL)	USA	AIRPORT	USVPS
Fort St. John	Canada	AIRPORT	CAYXJ
Fort Smith (AR)	USA	AIRPORT	USFSM
Fort Smith	Canada	AIRPORT	CAYSM
Fort Riley (KS)	USA	AIRPORT	USFRI
Fort Myers, Southwest Florida Reg (FL)	USA	AIRPORT	USRSW
Fort Myers, Metropolitan Area (FL)	USA	AIRPORT	USFMY
Fort McMurray	Canada	AIRPORT	CAYMM
Fort Lauderdale/Hollywood (FL)	USA	AIRPORT	USFLL
Fort Huachuca/Sierra Vista (AZ)	USA	AIRPORT	USFHU
Fort Dodge IA	USA	AIRPORT	USFOD
Fort Albert	Canada	AIRPORT	CAYFA
Floro	Norway	AIRPORT	NOFRO
Florianopolis	Brazil	AIRPORT	BRFLN
Florence (Firenze)	Italy	AIRPORT	ITFLR
Florence (SC)	USA	AIRPORT	USFLO
Flint (MI)	USA	AIRPORT	USFNT
Flin Flon	Canada	AIRPORT	CAYFO
Flagstaff (AZ)	USA	AIRPORT	USFLG
Figari	France	AIRPORT	FRFSC
Fes	Morocco	AIRPORT	MAFEZ
Fayetteville/Ft. Bragg (NC)	USA	AIRPORT	USFAY
Fayetteville (AR)	USA	AIRPORT	USFYV
Faroer	Denmark	AIRPORT	DKFAE
Faro	Portugal	AIRPORT	PTFAO
Farmington (NM)	USA	AIRPORT	USFMN
Fargo (ND) (MN)	USA	AIRPORT	USFAR
Faisalabad	Pakistan	AIRPORT	PKLYP
Fairbanks (AK)	USA	AIRPORT	USFAI
Fair Isle (Shetland)	United Kingdom	AIRPORT	GBFIE
Exeter	United Kingdom	AIRPORT	GBEXT
Evenes	Norway	AIRPORT	NOEVE
Evansville (IN)	USA	AIRPORT	USEVV
Eureka (CA)	USA	AIRPORT	USACV
Eugene (OR)	USA	AIRPORT	USEUG
Esperance	Australia	AIRPORT	AUEPR
Escanaba (MI)	USA	AIRPORT	USESC
Esbjerg	Denmark	AIRPORT	DKEBJ
Erzurum	Turkey	AIRPORT	TRERZ
Erzincan	Turkey	AIRPORT	TRERC
Eriwan (Yerevan, Jerevan)	Armenia	AIRPORT	AMEVN
Erie (PA)	USA	AIRPORT	USERI
Erfurt	Germany	AIRPORT	DEERF
Entebbe	Uganda	AIRPORT	UGEBB
Enontekioe	Finland	AIRPORT	FIENF
Emerald	Australia	AIRPORT	AUEMD
Ely (NV)	USA	AIRPORT	USELY
Elmira (NY)	USA	AIRPORT	USELM
Ellisras	South Africa	AIRPORT	ZAELL
Elko (NV)	USA	AIRPORT	USEKO
Elkhart (IN)	USA	AIRPORT	USEKI
Elba Island, Marina Di Campo	Italy	AIRPORT	ITEBA
Elat, Ovula	Israel	AIRPORT	ILVDA
Elat	Israel	AIRPORT	ILETH
El Paso (TX)	USA	AIRPORT	USELP
El Minya	Egypt	AIRPORT	EGEMY
Eindhoven	Netherlands	AIRPORT	NLEIN
Egilsstadir	Iceland	AIRPORT	ISEGS
Edmonton, Municipal	Canada	AIRPORT	CAYXD
Edmonton, International	Canada	AIRPORT	CAYEG
Edmonton	Canada	AIRPORT	CAYEA
Eau Clarie (WI)	USA	AIRPORT	USEAU
Easter Island	Chile	AIRPORT	CLIPC
East London	South Africa	AIRPORT	ZAELS
Dzaoudzi	Mayotte	AIRPORT	YTDZA
Dysart	Australia	AIRPORT	AUDYA
Dutch Harbor (AK)	USA	AIRPORT	USDUT
Dushanbe (Duschanbe)	Tajikistan	AIRPORT	TJDYU
Durban	South Africa	AIRPORT	ZADUR
Durango (CO)	USA	AIRPORT	USDRO
Dunk Island	Australia	AIRPORT	AUDKI
Dunedin	New Zealand	AIRPORT	NZDUD
Dundee	United Kingdom	AIRPORT	GBDND
Duluth (MN) /Superior (WI)	USA	AIRPORT	USDLH
Duesseldorf	Germany	AIRPORT	DEDUS
Dubuque IA	USA	AIRPORT	USDBQ
Dubois (PA)	USA	AIRPORT	USDUJ
Dublin	Ireland	AIRPORT	IEDUB
Dubbo	Australia	AIRPORT	AUDBO
Dubai	United Arab Emirates	AIRPORT	AEDXB
Dresden	Germany	AIRPORT	DEDRS
Douala	Cameroon	AIRPORT	CMDLA
Dothan (AL)	USA	AIRPORT	USDHN
Dortmund	Germany	AIRPORT	DEDTM
Donegal (Carrickfin)	Ireland	AIRPORT	IECFN
Doncaster/Sheffield	United Kingdom	AIRPORT	GBDSA
Doha	Qatar	AIRPORT	QADOH
Dodoma	Tanzania	AIRPORT	TZDOD
Djibouti (city)	Djibouti	AIRPORT	DJJIB
Djerba	Tunisia	AIRPORT	TNDJE
Disneyland Paris	France	AIRPORT	FRDLP
Dinard	France	AIRPORT	FRDNR
Dillingham (AK)	USA	AIRPORT	USDLG
Dhaka	Bangladesh	AIRPORT	BDDAC
Dhahran	Saudi Arabia	AIRPORT	SADHA
Devonport	Australia	AIRPORT	AUDPO
Devils Lake (ND)	USA	AIRPORT	USDVL
Detroit (MI)	USA	AIRPORT	USDTW
Detroit (MI) , Metropolitan Area	USA	AIRPORT	USDTT
Detroit (MI) , Coleman A. Young Municipal	USA	AIRPORT	USDET
Des Moines (IA)	USA	AIRPORT	USDSM
Derry (Londonderry)	United Kingdom	AIRPORT	GBLDY
Derby	Australia	AIRPORT	AUDRB
Dera Ismail Khan	Pakistan	AIRPORT	PKDSK
Denver (CO)	USA	AIRPORT	USDEN
Denpasar/Bali	Indonesia	AIRPORT	IDDPS
Denizli	Turkey	AIRPORT	TRDNZ
Den Haag (The Hague)	Netherlands	AIRPORT	NLHAG
Delhi	India	AIRPORT	INDEL
Deer Lake/Corner Brook	Canada	AIRPORT	CAYDF
Decatur (IL)	USA	AIRPORT	USDEC
Daytona Beach (FL)	USA	AIRPORT	USDAB
Dayton (OH)	USA	AIRPORT	USDAY
Daydream Island	Australia	AIRPORT	AUDDI
Darwin	Australia	AIRPORT	AUDRW
Dar es Salam (Daressalam)	Tanzania	AIRPORT	TZDAR
Danville (VA)	USA	AIRPORT	USDAN
Damascus, International	Syria	AIRPORT	SYDAM
Dallas/Ft. Worth (TX)	USA	AIRPORT	USDFW
Dallas (TX) , Love Field	USA	AIRPORT	USDAL
Dalby	Australia	AIRPORT	AUDBY
Dalaman	Turkey	AIRPORT	TRDLM
Dakar	Senegal	AIRPORT	SNDKR
Cuyo	Philippines	AIRPORT	PHCYU
Curitiba	Brazil	AIRPORT	BRCWB
Curacao	Netherlands Antilles	AIRPORT	ANCUR
Culiacan	Mexico	AIRPORT	MXCUL
Cuiaba	Brazil	AIRPORT	BRCGB
Crescent City (CA)	USA	AIRPORT	USCEC
Craig (AK)	USA	AIRPORT	USCGA
Cozmel	Mexico	AIRPORT	MXCZM
Coventry	United Kingdom	AIRPORT	GBCVT
Cottbus	Germany	AIRPORT	DECBU
Cotonou	Benin	AIRPORT	BJCOO
Corpus Christi (TX)	USA	AIRPORT	USCRP
Cork	Ireland	AIRPORT	IEORK
Corfu	Greece	AIRPORT	GRCFU
Cordova (AK)	USA	AIRPORT	USCDV
Cordoba	Spain	AIRPORT	ESODB
Cordoba	Argentina	AIRPORT	ARCOR
Copenhagen	Denmark	AIRPORT	DKCPH
Cooma	Australia	AIRPORT	AUOOM
Cooktown	Australia	AIRPORT	AUCTN
Coober Pedy	Australia	AIRPORT	AUCPD
Constantine	Algeria	AIRPORT	DZCZL
Constanta (Constanța)	Romania	AIRPORT	ROCND
Concord (NH)	USA	AIRPORT	USCON
Concord (CA)	USA	AIRPORT	USCCR
Conakry	Guinea	AIRPORT	GNCKY
Columbus (OH)	USA	AIRPORT	USCMH
Columbus (GA)	USA	AIRPORT	USCSG
Columbia (SC)	USA	AIRPORT	USCAE
Colorado Springs (CO)	USA	AIRPORT	USCOS
Colombo	Sri Lanka	AIRPORT	LKCMB
Cologne	Germany	AIRPORT	DECGN
Collinsville	Australia	AIRPORT	AUKCE
College Station/Bryan (TX)	USA	AIRPORT	USCLL
Colima	Mexico	AIRPORT	MXCLQ
Coimbatore	India	AIRPORT	INCJB
Coffs Harbour	Australia	AIRPORT	AUCFS
Coffmann Cove (AK)	USA	AIRPORT	USKCC
Cody/Powell/Yellowstone (WY)	USA	AIRPORT	USCOD
Cochin	India	AIRPORT	INCOK
Cochabamba	Bolivia	AIRPORT	BOCBB
Cleveland (OH) , Burke Lakefront	USA	AIRPORT	USBKL
Cleveland (OH)	USA	AIRPORT	USCLE
Clermont Ferrand	France	AIRPORT	FRCFE
Clermont	Australia	AIRPORT	AUCMQ
Clarksburg (WV)	USA	AIRPORT	USCKB
Ciudad Victoria	Mexico	AIRPORT	MXCVM
Ciudad Obregon	Mexico	AIRPORT	MXCEN
Ciudad Juarez	Mexico	AIRPORT	MXCJS
Ciudad Guayana	Venezuela	AIRPORT	VECGU
Ciudad Del Carmen	Mexico	AIRPORT	MXCME
Cincinnati (OH)	USA	AIRPORT	USCVG
Cienfuegos	Cuba	AIRPORT	CUCFG
Churchill	Canada	AIRPORT	CAYYQ
Chub Cay	Bahamas	AIRPORT	BSCCZ
Christchurch	New Zealand	AIRPORT	NZCHC
Chittagong	Bangladesh	AIRPORT	BDCGP
Chitral	Pakistan	AIRPORT	PKCJL
Chita (Tschita)	Russia	AIRPORT	RUHTA
Chisinau	Moldova	AIRPORT	MDKIV
Chipata	Zambia	AIRPORT	ZMCIP
Chios	Greece	AIRPORT	GRJKH
Chihuahua	Mexico	AIRPORT	MXCUU
Chico (CA)	USA	AIRPORT	USCIC
Chichen Itza	Mexico	AIRPORT	MXCZA
Chicago (IL)	USA	AIRPORT	USORD
Chicago (IL), Midway	USA	AIRPORT	USMDW
Chiba City	Japan	AIRPORT	JPQCB
Chiang Mai	Thailand	AIRPORT	THCNX
Cheyenne (WY)	USA	AIRPORT	USCYS
Chennai (Madras)	India	AIRPORT	INMAA
Chattanooga (TN)	USA	AIRPORT	USCHA
Charters Towers	Australia	AIRPORT	AUCXT
Charlottesville (VA)	USA	AIRPORT	USCHO
Charlotte (NC)	USA	AIRPORT	USCLT
Charleston (WV)	USA	AIRPORT	USCRW
Charleston (SC)	USA	AIRPORT	USCHS
Chania	Greece	AIRPORT	GRCHQ
Chandigarh	India	AIRPORT	INIXC
Champaign (IL)	USA	AIRPORT	USCMI
Chambery	France	AIRPORT	FRCMF
Chabarovsk (Khabarovsk)	Russia	AIRPORT	RUKHV
Cessnock	Australia	AIRPORT	AUCES
Ceduna	Australia	AIRPORT	AUCED
Cedar Rapids IA	USA	AIRPORT	USCID
Cedar City (UT)	USA	AIRPORT	USCDC
Cebu City	Philippines	AIRPORT	PHCEB
Catania	Italy	AIRPORT	ITCTA
Castries	Saint Lucia	AIRPORT	LCSLU
Castaway	Fiji	AIRPORT	FJCST
Casper (WY)	USA	AIRPORT	USCPR
Casino	Australia	AIRPORT	AUCSI
Casablanca, Mohamed V	Morocco	AIRPORT	MACMN
Casablanca	Morocco	AIRPORT	MACAS
Casa de Campo	Dominican Republic	AIRPORT	DOLRM
Cartagena	Colombia	AIRPORT	COCTG
Carson City (NV)	USA	AIRPORT	USCSN
Carnot	Central African Republic	AIRPORT	CFCRF
Carnarvon	Australia	AIRPORT	AUCVQ
Carlsbad (CA)	USA	AIRPORT	USCLD
Cardiff	United Kingdom	AIRPORT	GBCWL
Caracas	Venezuela	AIRPORT	VECCS
Cape Town	South Africa	AIRPORT	ZACPT
Cannes	France	AIRPORT	FRCEQ
Cancun	Mexico	AIRPORT	MXCUN
Canberra	Australia	AIRPORT	AUCBR
Campo Grande	Brazil	AIRPORT	BRCGR
Campbeltown	United Kingdom	AIRPORT	GBCAL
Cambrigde	United Kingdom	AIRPORT	GBCBG
Cambridge Bay	Canada	AIRPORT	CAYCB
Calvi	France	AIRPORT	FRCLY
Calicut	India	AIRPORT	INCCJ
Cali	Colombia	AIRPORT	COCLO
Calgary	Canada	AIRPORT	CAYYC
Calcutta (Kolkata)	India	AIRPORT	INCCU
Calama	Chile	AIRPORT	CLCJC
Cairo	Egypt	AIRPORT	EGCAI
Cairns	Australia	AIRPORT	AUCNS
Cagliari	Italy	AIRPORT	ITCAG
Cabinda	Angola	AIRPORT	AOCAB
Butte (MT)	USA	AIRPORT	USBTM
Burnie (Wynyard)	Australia	AIRPORT	AUBWT
Burlington IA	USA	AIRPORT	USBRL
Burlington (VT)	USA	AIRPORT	USBTV
Burbank (CA)	USA	AIRPORT	USBUR
Bundaberg	Australia	AIRPORT	AUBDB
Bullhead City (NV)	USA	AIRPORT	USBHC
Bulawayo	Zimbabwe	AIRPORT	ZWBUQ
Bujumbura	Burundi	AIRPORT	BIBJM
Buffalo/Niagara Falls (NY)	USA	AIRPORT	USBUF
Buffalo Range	Zimbabwe	AIRPORT	ZWBFO
Buenos Aires, Jorge Newbery	Argentina	AIRPORT	ARAEP
Buenos Aires	Argentina	AIRPORT	AREZE
Budapest	Hungary	AIRPORT	HUBUD
Bucharest	Romania	AIRPORT	ROOTP
Bucaramanga	Colombia	AIRPORT	COBGA
Brussels	Belgium	AIRPORT	BEBRU
Brunswick (GA)	USA	AIRPORT	USBQK
Broome	Australia	AIRPORT	AUBME
Brookings (SD)	USA	AIRPORT	USBKX
Broken Hill	Australia	AIRPORT	AUBHQ
Broennoeysund	Norway	AIRPORT	NOBNN
Bristol	United Kingdom	AIRPORT	GBBRS
Brisbane	Australia	AIRPORT	AUBNE
Brindisi	Italy	AIRPORT	ITBDS
Bridgetown	Barbados	AIRPORT	BBBGI
Bridgeport (CT)	USA	AIRPORT	USBDR
Bria	Central African Republic	AIRPORT	CFBIV
Brest	France	AIRPORT	FRBES
Brescia, Montichiari	Italy	AIRPORT	ITVBS
Bremen	Germany	AIRPORT	DEBRE
Bratislava	Slovakia	AIRPORT	SKBTS
Brasilia	Brazil	AIRPORT	BRBSB
Brampton Island	Australia	AIRPORT	AUBMP
Brainerd (MN)	USA	AIRPORT	USBRD
Bradford/Warren (PA) /Olean (NY)	USA	AIRPORT	USBFD
Bozeman (MT)	USA	AIRPORT	USBZN
Bowen	Australia	AIRPORT	AUZBO
Bournemouth	United Kingdom	AIRPORT	GBBOH
Bourgas/Burgas	Bulgaria	AIRPORT	BGBOJ
Boston (MA)	USA	AIRPORT	USBOS
Borrego Springs (CA)	USA	AIRPORT	USBXS
Bordeaux	France	AIRPORT	FRBOD
Bora Bora	French Polynesia	AIRPORT	PFBOB
Bonaventure, PQ	Canada	AIRPORT	CAYVB
Bonaire	Netherlands Antilles	AIRPORT	ANBON
Bombay (Mumbai)	India	AIRPORT	INBOM
Bologna	Italy	AIRPORT	ITBLQ
Boise (ID)	USA	AIRPORT	USBOI
Bogota	Colombia	AIRPORT	COBOG
Bodrum	Turkey	AIRPORT	TRBJV
Bodo	Norway	AIRPORT	NOBOO
Bobo/Dioulasso	Burkina Faso	AIRPORT	BFBOY
Boa Vista	Brazil	AIRPORT	BRBVB
Bluefield (WV)	USA	AIRPORT	USBLF
Bloomington (IN)	USA	AIRPORT	USBMG
Bloomington (IL)	USA	AIRPORT	USBMI
Bloemfontein	South Africa	AIRPORT	ZABFN
Blenheim	New Zealand	AIRPORT	NZBHE
Blantyre (Mandala)	Malawi	AIRPORT	MWBLZ
Blackwater	Australia	AIRPORT	AUBLT
Blackpool	United Kingdom	AIRPORT	GBBLK
Bissau	Guinea-Bissau	AIRPORT	GWBXO
Bismarck (ND)	USA	AIRPORT	USBIS
Bishkek	Kyrgyzstan	AIRPORT	KGFRU
Birmingham	United Kingdom	AIRPORT	GBBHX
Birmingham (AL)	USA	AIRPORT	USBHM
Biraro	Central African Republic	AIRPORT	CFIRO
Bintulu	Malaysia	AIRPORT	MYBTU
Billund	Denmark	AIRPORT	DKBLL
Billings (MT)	USA	AIRPORT	USBIL
Bilbao	Spain	AIRPORT	ESBIO
Biarritz	France	AIRPORT	FRBIQ
Bhubaneswar	India	AIRPORT	INBBI
Bhopal	India	AIRPORT	INBHO
Bethel (AK)	USA	AIRPORT	USBET
Berne, Railway Service	Switzerland	AIRPORT	CHZDJ
Berne, Bern	Switzerland	AIRPORT	CHBRN
Bermuda	Bermuda	AIRPORT	BMBDA
Berlin, Tegel	Germany	AIRPORT	DETXL
Berlin, Schoenefeld	Germany	AIRPORT	DESXF
Berlin	Germany	AIRPORT	DEBER
Bergerac	France	AIRPORT	FREGC
Bergen	Norway	AIRPORT	NOBGO
Bergamo/Milan	Italy	AIRPORT	ITBGY
Berberati	Central African Republic	AIRPORT	CFBBT
Benton Harbour (MI)	USA	AIRPORT	USBEH
Benguela	Angola	AIRPORT	AOBUG
Benghazi (Bengasi)	Libya	AIRPORT	LYBEN
Benbecula	United Kingdom	AIRPORT	GBBEB
Bemidji (MN)	USA	AIRPORT	USBJI
Belo Horizonte	Brazil	AIRPORT	BRCNF
Bellingham (WA)	USA	AIRPORT	USBLI
Belize City	Belize	AIRPORT	BZBZE
Belgrad (Beograd)	Serbia	AIRPORT	RSBEG
Belgaum	India	AIRPORT	INIXG
Belfast	United Kingdom	AIRPORT	GBBHD
Belem	Brazil	AIRPORT	BRBEL
Beirut	Lebanon	AIRPORT	LBBEY
Beira	Mozambique	AIRPORT	MZBEW
Beijing	China	AIRPORT	CNNAY
Beckley (WV)	USA	AIRPORT	USBKW
Beaumont/Pt. Arthur (TX)	USA	AIRPORT	USBPT
Bayreuth	Germany	AIRPORT	DEBYU
Baton Rouge (LA)	USA	AIRPORT	USBTR
Bastia	France	AIRPORT	FRBIA
Basseterre	Saint Kitts and Nevis	AIRPORT	KNSKB
Basra, Basrah	Iraq	AIRPORT	IQBSR
Basel	Switzerland	AIRPORT	CHBSL
Barranquilla	Colombia	AIRPORT	COBAQ
Barra	United Kingdom	AIRPORT	GBBRR
Baroda	India	AIRPORT	INBDQ
Barisal	Bangladesh	AIRPORT	BDBZL
Bari	Italy	AIRPORT	ITBRI
Bardufoss	Norway	AIRPORT	NOBDU
Barcelona	Venezuela	AIRPORT	VEBLA
Barcelona	Spain	AIRPORT	ESBCN
Bannu	Pakistan	AIRPORT	PKBNP
Banjul	Gambia	AIRPORT	GMBJL
Bangui	Central African Republic	AIRPORT	CFBGF
Bangor (ME)	USA	AIRPORT	USBGR
Bangkok, Don Muang	Thailand	AIRPORT	THDMK
Bangassou	Central African Republic	AIRPORT	CFBGU
Bangalore	India	AIRPORT	INBLR
Bandung	Indonesia	AIRPORT	IDBDO
Bandar Seri Begawan	Brunei	AIRPORT	BNBWN
Bambari	Central African Republic	AIRPORT	CFBBY
Bamako	Mali	AIRPORT	MLBKO
Bamaga	Australia	AIRPORT	AUABM
Baltimore (MD)	USA	AIRPORT	USBWI
Ballina	Australia	AIRPORT	AUBNK
Baku	Azerbaijan	AIRPORT	AZBAK
Bakersfield (CA)	USA	AIRPORT	USBFL
Bahrain	Bahrain	AIRPORT	BHBAH
Bahawalpur	Pakistan	AIRPORT	PKBHV
Bagdogra	India	AIRPORT	INIXB
Bagdad	Iraq	AIRPORT	IQBGW
Badajoz	Spain	AIRPORT	ESBJZ
Ayr	Australia	AIRPORT	AUAYR
Ayers Rock	Australia	AIRPORT	AUAYQ
Ayawasi	Indonesia	AIRPORT	IDAYW
Austin (TX)	USA	AIRPORT	USAUS
Aurillac	France	AIRPORT	FRAUR
Augusta (ME)	USA	AIRPORT	USAUG
Augusta (GA)	USA	AIRPORT	USAGS
Augsburg	Germany	AIRPORT	DEAGB
Auckland	New Zealand	AIRPORT	NZAKL
Attawapiskat, NT	Canada	AIRPORT	CAYAT
Atlantic City (NJ)	USA	AIRPORT	USACY
Atlanta (GA)	USA	AIRPORT	USATL
Athens	Greece	AIRPORT	GRHEW
Athens (OH)	USA	AIRPORT	USATO
Athens (GA)	USA	AIRPORT	USAHN
Aswan	Egypt	AIRPORT	EGASW
Asuncion	Paraguay	AIRPORT	PYASU
Astana	Kazakhstan	AIRPORT	KZTSE
Assiut	Egypt	AIRPORT	EGATZ
Aspen, (CO)	USA	AIRPORT	USASE
Asmara	Eritrea	AIRPORT	ERASM
Ashgabat	Turkmenistan	AIRPORT	TMASB
Asheville (NC)	USA	AIRPORT	USAVL
Arusha	Tanzania	AIRPORT	TZARK
Aruba	Aruba	AIRPORT	AWAUA
Arrecife/Lanzarote	Spain	AIRPORT	ESACE
Arlit	Niger	AIRPORT	NERLT
Arkhangelsk	Russia	AIRPORT	RUARH
Araxos	Greece	AIRPORT	GRGPA
Aracaju	Brazil	AIRPORT	BRAJU
Aqaba	Jordan	AIRPORT	JOAQJ
Appelton/Neenah/Menasha (WI)	USA	AIRPORT	USATW
Apia	Samoa	AIRPORT	WSAPW
Aomori	Japan	AIRPORT	JPAOJ
Antwerp	Belgium	AIRPORT	BEANR
Antigua	Antigua and Barbuda	AIRPORT	AGANU
Antananarivo (Tanannarive)	Madagascar	AIRPORT	MGTNR
Antalya	Turkey	AIRPORT	TRAYT
Anniston (AL)	USA	AIRPORT	USANB
Annecy	France	AIRPORT	FRNCY
Annaba	Algeria	AIRPORT	DZAAE
Ann Arbor (MI)	USA	AIRPORT	USARB
Ankara	Turkey	AIRPORT	TRESB
Anguilla	Anguilla	AIRPORT	AIAXA
Andorra La Vella	Andorra	AIRPORT	ADALV
Ancona	Italy	AIRPORT	ITAOI
Anchorage (AK)	USA	AIRPORT	USANC
Anand	India	AIRPORT	INQNB
Amritsar	India	AIRPORT	INATQ
Amman	Jordan	AIRPORT	JOAMM
Amazon Bay	Papua New Guinea	AIRPORT	PGAZB
Amarillo (TX)	USA	AIRPORT	USAMA
Amami	Japan	AIRPORT	JPASJ
Altus	USA	AIRPORT	USAXS
Altoona (PA)	USA	AIRPORT	USAOO
Altenrhein	Switzerland	AIRPORT	CHACH
Alta	Norway	AIRPORT	NOALF
Almeria	Spain	AIRPORT	ESLEI
Almaty (Alma Ata)	Kazakhstan	AIRPORT	KZALA
Allentown (PA)	USA	AIRPORT	USABE
Alldays	South Africa	AIRPORT	ZAADY
Alice Springs	Australia	AIRPORT	AUASP
Alicante	Spain	AIRPORT	ESALC
Algiers	Algeria	AIRPORT	DZALG
Alghero Sassari	Italy	AIRPORT	ITAHO
Alfujairah (Fujairah)	United Arab Emirates	AIRPORT	AEFJR
Alexandria	Egypt	AIRPORT	EGALY
Alexander Bay	South Africa	AIRPORT	ZAALJ
Alesund	Norway	AIRPORT	NOAES
Aleppo	Syria	AIRPORT	SYALP
Albury	Australia	AIRPORT	AUABX
Albuquerque (NM)	USA	AIRPORT	USABQ
Alborg	Denmark	AIRPORT	DKAAL
Albi	France	AIRPORT	FRLBI
Albany (NY)	USA	AIRPORT	USALB
Albany (GA)	USA	AIRPORT	USABY
Albany	Australia	AIRPORT	AUALH
Al Hoceima	Morocco	AIRPORT	MAAHU
Al Arish	Egypt	AIRPORT	EGAAC
Al Ain	United Arab Emirates	AIRPORT	AEAAN
Akrotiri	Cyprus	AIRPORT	CYAKT
Akron (OH)	USA	AIRPORT	USCAK
Akita	Japan	AIRPORT	JPAXT
Ajaccio	France	AIRPORT	FRAJA
Aiyura	Papua New Guinea	AIRPORT	PGAYU
Ahmedabad	India	AIRPORT	INAMD
Aguascaliente	Mexico	AIRPORT	MXAGU
Aguadilla	Puerto Rico	AIRPORT	PRBQN
Aggeneys	South Africa	AIRPORT	ZAAGZ
Agana (Hagåtña)	Guam	AIRPORT	GUSUM
Agadir	Morocco	AIRPORT	MAAGA
Agades	Niger	AIRPORT	NEAJY
Adler/Sochi	Russia	AIRPORT	RUAER
Adiyaman	Turkey	AIRPORT	TRADF
Aden	Yemen	AIRPORT	YEADE
Adelaide	Australia	AIRPORT	AUADL
Addis Ababa	Ethiopia	AIRPORT	ETADD
Adana	Turkey	AIRPORT	TRADA
Accra	Ghana	AIRPORT	GHACC
Acapulco	Mexico	AIRPORT	MXACA
Abuja	Nigeria	AIRPORT	NGABV
Abu Simbel	Egypt	AIRPORT	EGABS
Abu Rudeis	Egypt	AIRPORT	EGAUE
Abu Dhabi	United Arab Emirates	AIRPORT	AEAUH
Abilene (TX)	USA	AIRPORT	USABI
Aberdeen (SD)	USA	AIRPORT	USABR
Aberdeen	United Kingdom	AIRPORT	GBABZ
Abeche	Chad	AIRPORT	TDAEH
Abadan	Iran	AIRPORT	IRABD
Aarhus	Denmark	AIRPORT	DKAAR`;

function parsePortData(): PortSeed[] {
  return RAW_PORT_DATA.trim()
    .split('\n')
    .map((line) => {
      const [name, countryName, portMode, unlocode] = line.split('\t');
      return {
        name: name.trim(),
        countryName: countryName.trim(),
        portMode: portMode.trim() as PortSeed['portMode'],
        unlocode: unlocode?.trim() || null,
      };
    })
    .filter((p) => p.name && p.countryName && p.portMode);
}

function normalizeValue(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCode(
  name: string,
  portMode: PortSeed['portMode'],
  unlocode: string | null,
) {
  if (unlocode) return unlocode;
  const prefix = portMode === 'AIRPORT' ? 'AIR' : 'SEA';
  const slug = normalizeValue(name).replace(/\s+/g, '-').slice(0, 24);
  return `${prefix}-${slug}`;
}

export class BusinessComprehensivePortMaster2026032801300
  implements MigrationInterface
{
  name = 'BusinessComprehensivePortMaster2026032801300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove old demo/manual and minimal seed ports
    await queryRunner.query(
      `DELETE FROM "port_master" WHERE "sourceConfidence" IN ('MANUAL_DEMO', 'SEED_MINIMAL')`,
    );

    const ports = parsePortData();
    for (const port of ports) {
      const code = buildCode(port.name, port.portMode, port.unlocode);
      await queryRunner.query(
        `
          INSERT INTO "port_master" (
            "code", "name", "normalizedName",
            "cityName", "normalizedCityName",
            "stateName", "countryName", "normalizedCountryName",
            "portMode", "regionId", "unlocode",
            "sourceConfidence", "isActive", "notes"
          )
          SELECT
            $1::varchar, $2::varchar, $3::varchar,
            $2::varchar, $3::varchar,
            NULL, $4::varchar, $5::varchar,
            $6::"port_master_portmode_enum", NULL, $7,
            'SEED_COMPREHENSIVE', true,
            'Imported from comprehensive port master spreadsheet'
          WHERE NOT EXISTS (
            SELECT 1 FROM "port_master"
            WHERE "code" = $1::varchar
              AND "portMode" = $6::"port_master_portmode_enum"
          )
        `,
        [
          code,
          port.name,
          normalizeValue(port.name),
          port.countryName,
          normalizeValue(port.countryName),
          port.portMode,
          port.unlocode,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "port_master" WHERE "sourceConfidence" = 'SEED_COMPREHENSIVE'`,
    );
  }
}
