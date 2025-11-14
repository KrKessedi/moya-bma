import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
const firebaseConfig = {
	apiKey: 'AIzaSyDZ8Ww486uYs4QOa_hbbbWFHOqybQ85AoY',
	authDomain: 'dishes-d1f87.firebaseapp.com',
	databaseURL: 'https://dishes-d1f87-default-rtdb.firebaseio.com',
	projectId: 'dishes-d1f87',
	storageBucket: 'dishes-d1f87.appspot.com',
	messagingSenderId: '347147244971',
	appId: '1:347147244971:web:fc510494c37bfb411baeee',
}

// Инициализация приложения
const app = initializeApp(firebaseConfig)

// Экспортируй базу и хранилище
export const db = getDatabase(app)
export const storage = getStorage(app)
