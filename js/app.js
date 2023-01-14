// EFFETTUA UN RECUPERO DELLA LISTA DEI PRODOTTI
async function fetchFishesList() {
  let dataJson = await fetch('./assets/data/fishes.json');
  dataJson = await dataJson.json();
  return dataJson;
}

// CREA LISTA DEI PRODOTTI SELEZIONABILI E AGGIUNGE LE PRINCIPALI FUNZIONALITA'
function generateFishingShop(dataJson) {
	const fishesSection = document.querySelector(".products");
	dataJson.forEach((data) => {
		const dataTemplate = `<div class="products__item">
			<div class="products__item__content" data-id="${data.name}">
				<div id="${data.name}" class="fish" draggable="true" data-size="${data.size}" data-price="${data.priceByKg}">
					<img src="assets/images/fish/${data.name}.png" alt="" />
				</div>
			</div>
			<div class="fish__name">${data.name.charAt(0).toUpperCase() + data.name.slice(1).replace(/-/g, ' ')}</div>
		</div>`
		fishesSection.insertAdjacentHTML("beforeend", dataTemplate);
	});
	generateAppFunctions();
}

// ASSEGNA FUNZIONI PRINCIPALI DELL'APP
function generateAppFunctions() {
	const productsList = document.querySelector('.products');
	const scale = document.querySelector(".scale__space");
	const fishesItemContent = document.querySelectorAll(".products__item__content");
	setDragListeners(productsList);
	setTouchListeners();
	setAddTo(scale);
	setRemoveFromScaleTo(fishesItemContent);
}

// ASSEGNA FUNZIONE DI DRAGGING AD OGNI PRODOTTO IN LISTA PRODOTTI
function setDragListeners(productsList) {
	productsList.addEventListener('mousedown', (e) => {
		let fish = e.target.parentElement;
		if (fish.classList.contains('fish')) {
			fish.addEventListener("dragstart", () => {
				fish.classList.add("dragging");
			});
			fish.addEventListener("dragend", () => {
				fish.classList.remove("dragging");
			});
		}
	})
}

// ASSEGNA FUNZIONI DI TOUCH AD OGNI PRODOTTO IN LISTA PRODOTTI - PER MOBILE
function touchendUpdate(draggedFish) {
	draggedFish.style.position = "";
	draggedFish.style.top = ``;
	draggedFish.style.left = ``;
	draggedFish.style.transform = `translate(0,0)`;
	draggedFish.style.zIndex = 1;
	draggedFish.classList.remove("dragging");
	updatePrice();
	updateSize();
	addRemoveBtn();
}

// AGGIUNGI FUNZIONI TOUCH
function setTouchListeners() {
	let fishesList = document.querySelectorAll('.fish img');
	fishesList.forEach((image) => {
		let fish = image.parentElement;
		if(!fish.classList.add('touch-listening')) {
			fish.classList.add('touch-listening');
			fish.addEventListener("touchstart", (e) => {
				e.preventDefault();
				[...e.changedTouches].forEach((touch) => {
					fish.classList.add("dragging");
					fish.style.position = "absolute";
					fish.style.top = `${touch.pageY}px`;
					fish.style.left = `${touch.pageX}px`;
					fish.style.transform = `translate(-50%,-50%)`;
				})
			});
			fish.addEventListener("touchmove", (e) => {
				e.preventDefault();
				[...e.changedTouches].forEach((touch) => {
					fish.style.top = `${touch.pageY}px`;
					fish.style.left = `${touch.pageX}px`;
					fish.style.transform = `translate(-50%,-50%)`;
					fish.style.zIndex = 9;
				})
			});
			fish.addEventListener("touchend", (e) => {
				e.preventDefault();
				[...e.changedTouches].forEach((touch) => {
					let currentContainer = fish.parentElement;
					let draggedFish = document.querySelector('.dragging');
					if (draggedFish) {
						draggedFish.style.zIndex = -1;
					}
					let hoveredElement = document.elementFromPoint(touch.clientX, touch.clientY);
					if (hoveredElement.classList.contains('scale__space') || hoveredElement.dataset.id == fish.id ) {
						hoveredElement.appendChild(fish);
						touchendUpdate(fish);
						fish.classList.add('touch-listening');
					} else if (hoveredElement.tagName == 'IMG' || hoveredElement.classList.contains('fish')) {
						hoveredElement.closest('.scale__space').insertAdjacentElement("beforeend", fish);
						touchendUpdate(fish);
						fish.classList.add('touch-listening');
					} else {
						currentContainer.appendChild(fish);
						touchendUpdate(fish);
						fish.classList.add('touch-listening');
					}
				})
			});
		}
	})
}

// AGGIUNGE ALLA BILANCIA I PRODOTTI TRASCINATI
function setAddTo(scale) {
	scale.addEventListener("dragover", (e) => {
		e.preventDefault();
		let draggedFish = document.querySelector(".dragging");
		scale.appendChild(draggedFish);
		updatePrice();
		updateSize();
		addRemoveBtn();
	});
}

// RIMUOVI DALLA BILANCIA
function setRemoveFromScaleTo(fishesItemContent) {
	// TRAMITE TRASCINAMENTO
	fishesItemContent.forEach((content) => {
		content.addEventListener("dragover", (e) => {
			e.preventDefault();
			let draggedFish = document.querySelector(".dragging");
			if (content.dataset.id == draggedFish.id) {
				content.appendChild(draggedFish);
			}
			updatePrice();
			updateSize();
		});
	});

	// TRAMITE CLICK SU PULSANTE "RIMUOVI"
	const scale = document.querySelector(".scale__space");

	function removeProductFromScale(e) {
		const fishOnScale = e.target.parentElement;
		const fishOnScaleId = fishOnScale.id;
		const fishCloned = fishOnScale.cloneNode(true);
		touchendUpdate(fishCloned); 
		fishOnScale.querySelector('.remove').remove();
		document.querySelector('div[data-id="' + fishOnScaleId +'"]').insertAdjacentElement('beforeend', fishCloned);
		fishOnScale.remove();
		updatePrice();
		updateSize();
		setTouchListeners();
	}

	scale.addEventListener('click', (e) => {
		if (e.target.classList.contains('remove')) {
			removeProductFromScale(e);
		}
	});

	scale.addEventListener('touchstart', (e) => {
		if (e.target.classList.contains('remove')) {
			removeProductFromScale(e);
		}
	});
}

// AGGIUNGI PULSANTE "RIMUOVI" A TUTTI I PRODOTTI SULLA BILANCIA
function addRemoveBtn() {
	const scaleProducts = document.querySelectorAll(".scale__space .fish");
	const removeButton = `<div class="remove"></div>`;
	scaleProducts.forEach((product) => {
		if (!product.querySelector('.remove')) {
			product.insertAdjacentHTML("beforeend", removeButton);
		}
	})
}

// AGGIORNA PREZZO MENTRE AGGIUNGI/RIMUOVI PRODOTTI DALLA BILANCIA
function updatePrice() {
	let totalPrice = 0;
	const totalCounter = document.querySelector('.scale__total');
	const scaleProducts = document.querySelectorAll(".scale__space .fish");
	scaleProducts.forEach((product) => {
		let productPrice = product.dataset.price * product.dataset.size;
		totalPrice += Number(productPrice);
	})
	totalCounter.innerHTML = totalPrice;
}

// AGGIORNA PESO MENTRE AGGIUNGI/RIMUOVI PRODOTTI DALLA BILANCIA
function updateSize() {
	let totalSize = 0;
	const sizeCounter = document.querySelector('.scale__size span');
	const scaleProducts = document.querySelectorAll(".scale__space .fish");
	scaleProducts.forEach((product) => {
		let productSize = product.dataset.size;
		totalSize += Number(productSize);
	})
	sizeCounter.innerHTML = totalSize + 'Kg';
}

// GENERA APP E FUNZIONALITA' AL RECUPERO DELLA LISTA DEI PRODOTTI
fetchFishesList().then(dataJson => generateFishingShop(dataJson));