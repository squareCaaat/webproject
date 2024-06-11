//map implementation
var container = document.getElementById('map');
var options = {
    center: new kakao.maps.LatLng(35.18003483348194, 129.07493819187425),
    level: 6
};
// 지도 생성
var map = new kakao.maps.Map(container, options);
// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();
// 클러스터링 기능능
var clusterer = new kakao.maps.MarkerClusterer({
    map: map,
    averageCenter: true,
    minLevel: 7
});
//handle map marker
var markers = [];

// 줌 인/아웃
function zoomIn() {
    map.setLevel(map.getLevel() - 1);
}

function zoomOut() {
    map.setLevel(map.getLevel() + 1);
}

// 스카이뷰/지도 타입 변경
function setMapType(maptype) { 
    var roadmapControl = document.getElementById('btnRoadmap');
    var skyviewControl = document.getElementById('btnSkyview'); 
    if (maptype === 'roadmap') {
        map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);    
        roadmapControl.className = 'selected_btn';
        skyviewControl.className = 'btn';
        relayout();
    } else {
        map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);    
        skyviewControl.className = 'selected_btn';
        roadmapControl.className = 'btn';
        relayout();
    }
}

function relayout() {    
    // 지도를 표시하는 div 크기를 변경한 이후 지도가 정상적으로 표출되지 않을 수도 있습니다
    // 크기를 변경한 이후에는 반드시  map.relayout 함수를 호출해야 합니다 
    // window의 resize 이벤트에 의한 크기변경은 map.relayout 함수가 자동으로 호출됩니다
    map.relayout();
}

//css control
function openBar(){
    document.getElementById('sidebar').style.width = '250px';
    document.getElementById('main').style.marginLeft = '250px';
    document.getElementById('openbtn').style.display = 'none';
}

function closeBar(){
    document.getElementById('sidebar').style.width = '0';
    document.getElementById('main').style.marginLeft = '0';
    document.getElementById('openbtn').style.display = 'inline';
}

//openAPI implementaion
async function fetchData() {
    const response = 
            await fetch('https://apis.data.go.kr/6260000/GoodPriceStoreService/getGoodPriceStore?serviceKey=wMPj3KtrAGElpdH4MKeC0CHjJg%2FNKvHPXd9Anmj6rjL%2Fl43xbSEbEoGGTQJOdEj6yR3XhclIs3OZtav0Lyq2Jg%3D%3D&pageNo=1&numOfRows=500&resultType=json');
    const data = await response.json();
    return data.getGoodPriceStore.body.items.item; 
}

function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.id = `${item.idx}`;
    header.textContent = item.sj;
    card.appendChild(header);

    const body = document.createElement('div');
    body.className = 'card-body';

    const img = document.createElement('img');
    if(item.imgFile1){
        img.src = `https://${item.imgFile1}`;
        img.alt = item.imgName1;
        body.appendChild(img);
        card.appendChild(body);
    } else if(item.imgFile2){
        img.src = `https://${item.imgFile2}`;
        img.alt = item.imgName2;
        body.appendChild(img);
        card.appendChild(body);
    } else{
        img.src = 'media/no-image.jpg';
        img.alt = 'no image';
        body.appendChild(img);
        card.appendChild(body);
    }

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const cn = document.createElement('p');
    cn.className = 'category';
    cn.textContent = `${item.cn}`;
    footer.appendChild(cn);

    const tel = document.createElement('p');
    tel.className = 'tel';
    tel.textContent = item.tel? `Tel: ${item.tel}` : 'Tel: 없음';
    footer.appendChild(tel);

    const adres = document.createElement('p');
    adres.className = 'adress';
    adres.textContent = `${item.adres}`;
    footer.appendChild(adres);
    
    if(item.intrcn != '<p><br></p>' || item.intrcn != ' ' || item.intrcn != '' || item.intrcn != '<p>&nbsp;</p>'){
        const intrcn = document.createElement('div');
        intrcn.className = 'introduction';
        intrcn.innerHTML = item.intrcn;
        intrcn.style.overflow = 'auto';
        footer.appendChild(document.createElement('hr'));
        footer.appendChild(intrcn);
    }
    
    card.appendChild(footer);

    return card;
}

function displayData(data) {
    const container = document.getElementById('data-container');
    container.innerHTML = ''; // Clear existing content
    data.forEach(item => {
        const card = createCard(item);
        container.appendChild(card);
    });
}


//지도에 해당 업체의 위치르 마커로 찍기
// 주소로 좌표를 검색합니다
function putMarkMap(data){
    data.forEach((item)=>{
        if(item.adres.indexOf('부산') == -1){
            item.adres = '부산 ' + item.adres;
        }
        geocoder.addressSearch(item.adres, function(result, status) {
            if (status === kakao.maps.services.Status.OK) { // 정상적으로 검색이 완료됐으면 
                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                var marker = new kakao.maps.Marker({ // 결과값으로 받은 위치를 마커로 표시합니다
                    map: map,
                    position: coords
                });
                markers.push(marker);
                // 마커에 커서가 오버됐을 때 마커 위에 표시할 인포윈도우를 생성합니다
                var iwContent = `<div style="width:150px;text-align:center;padding:6px 0;">${item.sj}</div>`;
                var infowindow = new kakao.maps.InfoWindow({ // 인포윈도우를 생성합니다
                    content : iwContent
                });
                kakao.maps.event.addListener(marker, 'mouseover', function() { // 마커에 마우스오버 이벤트를 등록합니다
                    infowindow.open(map, marker); // 마커에 마우스오버 이벤트가 발생하면 인포윈도우를 마커위에 표시합니다
                });
                kakao.maps.event.addListener(marker, 'mouseout', function() { // 마커에 마우스아웃 이벤트를 등록합니다
                    infowindow.close(); // 마커에 마우스아웃 이벤트가 발생하면 인포윈도우를 제거합니다
                });
                if(data.length == 1){
                    map.setCenter(coords);
                }
            } 
        });
    });
}
function putClusterMap(data) {
    const markers = data.map(item => {
        if (item.adres.indexOf('부산') === -1) {
            item.adres = '부산 ' + item.adres;
        }
        return new Promise((resolve, reject) => {
            geocoder.addressSearch(item.adres, function(result, status) {
                if (status === kakao.maps.services.Status.OK) {
                    var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                    var marker = new kakao.maps.Marker({
                        position: coords
                    });
                    resolve(marker);
                } else {
                    resolve(null);
                }
            });
        });
    });

    Promise.all(markers).then(markers => {
        markers = markers.filter(marker => marker !== null);
        clusterer.addMarkers(markers);
    });
}


const dongData = {
    "중구": ["광복동", "남포동", "대창동", "동광동", "보수동", "부평동", "신창동", "영주동", "중앙동", "대청동", "창선동"],
    "동구": ["범일동", "수정동", "좌천동", "초량동"],
    "서구": ["동대신동", "부민동", "서대신동", "아미동", "암남동", "초장동", "충무동", "토성동", "신호동"],
    "영도구": ["남항동", "봉래동", "신선동", "영선동", "청학동", "동삼동"],
    "부산진구": ["개금동", "당감동", "범전동", "범천동", "부암동", "부전동", "양정동", "전포동", "연지동", "초읍동"],
    "동래구": ["낙민동", "명륜동", "복천동", "사직동", "수안동", "안락동", "명장동","온천동"],
    "연제구": ["거제동", "연산동"],
    "금정구": ["구서동", "금사동", "남산동", "부곡동", "서동", "선동", "오륜동", "장전동", "청룡동", "회동동"],
    "북구": ["구포동", "금곡동", "덕천동", "만덕동", "화명동"],
    "사상구": ["감전동", "괘법동", "덕포동", "모라동", "삼락동", "엄궁동", "주례동"],
    "사하구": ["감천동", "괴정동", "구평동", "다대동", "당리동", "신평동", "장림동", "하단동"],
    "강서구": ["대저동", "명지동", "녹산동", "가락동", "범방동", "생곡동", "송정동", "죽림동", "지사동", "천가동", "화전동"],
    "남구": ["감만동", "대연동", "문현동", "용당동", "용호동", "우암동"],
    "해운대구": ["반여동", "반송동", "송정동", "우동", "좌동", "중동"],
    "수영구": ["광안동", "남천동", "망미동", "민락동", "수영동"],
    "기장군": ["기장읍", "장안읍", "정관읍", "일광읍", "철마면"]
};

async function updateDongOptions() {
    const guSelect = document.getElementById('filter-gu');
    const dongSelect = document.getElementById('filter-dong');
    const selectedGu = guSelect.value;

    dongSelect.innerHTML = '<option value="all">모두</option>'; // Reset dong options

    if (selectedGu in dongData) {
        dongData[selectedGu].forEach(dong => {
            const option = document.createElement('option');
            option.value = dong;
            option.textContent = dong;
            dongSelect.appendChild(option);
        });
    } else {
        try {
            const response = await fetchAdditionalDongData(selectedGu);
            const additionalDongData = await response.json();
            dongData[selectedGu] = Object.keys(additionalDongData);
            dongData[selectedGu].forEach(dong => {
                const option = document.createElement('option');
                option.value = dong;
                option.textContent = dong;
                dongSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching additional dong data:', error);
        }
    }
}

// 지도에 있는 기존 마커들을 제거하는 함수
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    clusterer.clear();
}



//handle filter
async function applyFilters() {
    const data = await fetchData();
    const parkingFilter = document.getElementById('filter-parking').value;
    const categoryFilter = document.getElementById('filter-category').value;
    const guFilter = document.getElementById('filter-gu').value;
    const dongFilter = document.getElementById('filter-dong').value;

    

    let filteredData = data;

    if (parkingFilter !== 'all') {
        filteredData = filteredData.filter(item => item.parkngAt === parkingFilter);
    }

    if (categoryFilter !== 'all') {
        filteredData = filteredData.filter(item => item.cn === categoryFilter);
    }

    if (guFilter !== 'all') {
        if (dongFilter !== 'all') {
            filteredData = filteredData.filter(item => {
                // 주소에서 괄호 안의 동 정보를 추출
                const match = item.adres.match(/\(([^)]+)\)/);
                const innerDong = match ? match[1] : null;
                // 동 필터와 주소 비교
                return item.adres.includes(guFilter) && (item.adres.includes(dongFilter) || (innerDong && innerDong.includes(dongFilter)));
            });
        } else {
            filteredData = filteredData.filter(item => {
                const addressParts = item.adres.split(' ');
                return addressParts.includes(guFilter);
            });
        }
    }

    displayData(filteredData);
    clearMarkers(); // 기존 마커 제거
    if (dongFilter !== 'all') {
        putMarkMap(filteredData);
    } else {
        putClusterMap(filteredData);
    }; // 필터링된 데이터로 마커 표시
 
    // 필터링된 데이터가 있으면 해당 가게의 주소를 카카오맵에서 검색하여 중심좌표로 지도 이동
    if (filteredData.length > 0) {
        const firstStoreAddress = filteredData[0].adres; // 첫 번째 가게의 주소 가져오기
        const geocoder = new kakao.maps.services.Geocoder(); // 주소로 좌표 변환
        geocoder.addressSearch(firstStoreAddress, function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                const firstStoreCoords = new kakao.maps.LatLng(result[0].y, result[0].x);
                map.setCenter(firstStoreCoords);
                if (dongFilter !== 'all') { // 동 필터가 적용되면 지도 레벨을 낮춰 확대
                    map.setLevel(3); 
                } else {
                    map.setLevel(5); // 기본 레벨로 설정
                }
            } else { // 주소 검색 실패 시, 경고 메시지 출력 혹은 기본 위치로 이동
                alert('가게의 주소를 찾을 수 없습니다.');
                const defaultCoords = new kakao.maps.LatLng(35.18003483348194, 129.07493819187425);
                map.setCenter(defaultCoords);
            }
        });
    } else {  // 필터링된 데이터가 없을 경우, 경고 메시지 출력 혹은 기본 위치로 이동
        alert('해당 지역에 대한 데이터가 없습니다.');
        const defaultCoords = new kakao.maps.LatLng(35.18003483348194, 129.07493819187425);
        map.setCenter(defaultCoords);
    }
}

function resetFilters() {
    // 필터 초기화
    document.getElementById('filter-parking').value = 'all';
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-gu').value = 'all';
    document.getElementById('filter-dong').value = 'all';

    // 가게 정보 다시 보여주기
    fetchData().then(data => {
        displayData(data);
        clearMarkers(); // 기존 마커 제거
        putMarkMap(data); // 모든 데이터로 마커 표시
        putClusterMap(filteredData);
        // 지도 초기 설정 위치로 이동
        const defaultCoords = new kakao.maps.LatLng(35.18003483348194, 129.07493819187425);
        map.setCenter(defaultCoords);
        map.setLevel(6); // 초기 레벨로 설정
    });
}

document.getElementById('apply-filters').addEventListener('click', () => {
    markers.forEach((mark)=>{mark.setMap(null)});
    fetchData().then(data => {
        applyFilters(data);
    });
});

document.getElementById('reset-filters').addEventListener('click', resetFilters);

//handle search
function searchStore(data){
    const searchText = document.getElementById('store_name').value;
    const filteredData = data.filter(item => item.sj.includes(searchText));
    markers.forEach((mark)=>{mark.setMap(null)});
    putMarkMap(filteredData);
    displayData(filteredData);
}

document.getElementById('searchbtn').addEventListener('click', () => {
    fetchData().then(data => {
        searchStore(data);
    })
})

// Initial load
fetchData().then(data => {
    putClusterMap(data);
    displayData(data);
    relayout();
});