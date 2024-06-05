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
    return data.getGoodPriceStore.body.items.item; // Adjust based on your API structure
}

function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.textContent = item.sj; // 업소명
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

    const cn = document.createElement('div');
    cn.textContent = `${item.cn}`;
    footer.appendChild(cn); //업소구분

    const tel = document.createElement('div');
    tel.textContent = item.tel? `Tel: ${item.tel}` : 'Tel: 없음';
    footer.appendChild(tel); // 전화번호

    const adres = document.createElement('div');
    adres.textContent = `${item.adres}`;
    footer.appendChild(adres); // 주소

    const intrcn = document.createElement('div'); // 소개
    let line = document.createElement('hr');
    intrcn.className = 'introduction';
    
    if (item.intrcn != null) {
        intrcn.innerHTML = item.intrcn;
        intrcn.style.overflow = 'auto';
        intrcn.classList.add('intrcn-font'); // 글씨체를 통일할 클래스 추가
        footer.appendChild(line);
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
            filteredData = filteredData.filter(item => item.adres.includes(`${guFilter} ${dongFilter}`));
        } else {
            filteredData = filteredData.filter(item => item.adres.includes(guFilter));
        }
    }

    displayData(filteredData);
}

// 필터 적용 
document.getElementById('apply-filters').addEventListener('click', () => { 
    fetchData().then(data => {
        applyFilters(data);
    });
});
    
// 초기 로드
fetchData().then(data => {
    displayData(data);
});

function resetFilters() {
    // 필터 초기화
    document.getElementById('filter-parking').value = 'all';
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-gu').value = 'all';
    document.getElementById('filter-dong').value = 'all';

    // 가게 정보 다시 보여주기
    fetchData().then(displayData);
}

// 초기화 버튼에 이벤트 리스너 추가
document.getElementById('reset-filters').addEventListener('click', resetFilters);

const dongData = {
    "중구": ["광복동", "남포동", "대창동", "동광동", "보수동", "부평동", "신창동", "영주동", "중앙동", "대청동", "창선동"],
    "동구": ["범일동", "수정동", "좌천동", "초량동"],
    "서구": ["동대신동", "부민동", "서대신동", "아미동", "암남동", "초장동", "충무동", "토성동", "신호동"],
    "영도구": ["남항동", "봉래동", "신선동", "영선동", "청학동", "동삼동"],
    "부산진구": ["개금동", "당감동", "범전동", "범천동", "부암동", "부전동", "양정동", "전포동", "연지동", "초읍동"],
    "동래구": ["낙민동", "명륜동", "복천동", "사직동", "수안동", "안락동", "명장동"],
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

// 카카오 맵
//map implementation // 맵 초기화
var container = document.getElementById('map');
var options = {
    center: new kakao.maps.LatLng(35.18003483348194, 129.07493819187425),
    level: 4
};
// 지도 생성
var map = new kakao.maps.Map(container, options);

// 스카이뷰/지도 타입 변경
function setMapType(maptype) { 
    var roadmapControl = document.getElementById('btnRoadmap');
    var skyviewControl = document.getElementById('btnSkyview'); 
    if (maptype === 'roadmap') {
        map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);    
        roadmapControl.className = 'selected_btn';
        skyviewControl.className = 'btn';
    } else {
        map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);    
        skyviewControl.className = 'selected_btn';
        roadmapControl.className = 'btn';
    }
}
// 줌 인/아웃
function zoomIn() {
    map.setLevel(map.getLevel() - 1);
}

function zoomOut() {
    map.setLevel(map.getLevel() + 1);
}

// 지도를 클릭한 위치에 표출할 마커입니다
var marker = new kakao.maps.Marker({ 
    // 지도 중심좌표에 마커를 생성합니다 
    position: map.getCenter() 
}); 
// 지도에 마커를 표시합니다
marker.setMap(map);

// 지도에 클릭 이벤트를 등록합니다
// 지도를 클릭하면 마지막 파라미터로 넘어온 함수를 호출합니다
/*kakao.maps.event.addListener(map, 'click', function(mouseEvent) {        
    
    // 클릭한 위도, 경도 정보를 가져옵니다 
    var latlng = mouseEvent.latLng; 
    
    // 마커 위치를 클릭한 위치로 옮깁니다
    marker.setPosition(latlng);
}); */

// 마커에 커서가 오버됐을 때 마커 위에 표시할 인포윈도우를 생성합니다
var iwContent = '<div style="padding:5px;">상점이름</div>'; // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다

// 인포윈도우를 생성합니다
var infowindow = new kakao.maps.InfoWindow({
    content : iwContent
});

// 마커에 마우스오버 이벤트를 등록합니다
kakao.maps.event.addListener(marker, 'mouseover', function() {
  // 마커에 마우스오버 이벤트가 발생하면 인포윈도우를 마커위에 표시합니다
    infowindow.open(map, marker);
});

// 마커에 마우스아웃 이벤트를 등록합니다
kakao.maps.event.addListener(marker, 'mouseout', function() {
    // 마커에 마우스아웃 이벤트가 발생하면 인포윈도우를 제거합니다
    infowindow.close();
});

// 지도를 표시하는 div 크기를 변경하는 함수입니다
// function resizeMap() {
//     var mapContainer = document.getElementById('map');
//     mapContainer.style.width = '100%';
//     mapContainer.style.height = '30vh'; 
// }

function relayout() {    
    
    // 지도를 표시하는 div 크기를 변경한 이후 지도가 정상적으로 표출되지 않을 수도 있습니다
    // 크기를 변경한 이후에는 반드시  map.relayout 함수를 호출해야 합니다 
    // window의 resize 이벤트에 의한 크기변경은 map.relayout 함수가 자동으로 호출됩니다
    map.relayout();
}
window.addEventListener('DOMContentLoaded', (event) => { // 로드되고 파싱되었을 때 발생
    map.relayout(); // 지도 재배치
    map.setCenter(35.18003483348194, 129.07493819187425); // 중심설정
});
