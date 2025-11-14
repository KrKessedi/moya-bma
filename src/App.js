import React, { useEffect, useState } from 'react'
import { ref as dbRef, push, onValue, update } from 'firebase/database'
import heart from './icons/heart-love-marriage-40-svgrepo-com.svg'
import heart2 from './icons/heart-love-marriage-15-svgrepo-com.svg'
import heart3 from './icons/heart-passion-svgrepo-com.svg'
import {
	ref as storageRef,
	uploadBytes,
	getDownloadURL,
} from 'firebase/storage'
import { db, storage } from './firebaseConfig'

function App() {
	const [imageFile, setImageFile] = useState(null)
	const [bought, setBought] = useState('')
	const [given, setGiven] = useState('')
	const [profilesBegimay, setProfiles] = useState([])

	const [day, setDay] = useState('')
	const [month, setMonth] = useState('')
	const [totalCount, setTotalCount] = useState(0)
	const [visibleCount, setVisibleCount] = useState(0)

	const [lighter, setLighter] = useState(false)
	const [filterBrand, setFilterBrand] = useState('Все')

	const cigarettes = [
		'Winston XStyle Blue',
		'Winston XStyle Silver',
		'Winston XStyle Dual',
		'Winston XStyle Caster',
		'Winston Purple Mix',
		'Winston XStyle Caster Dream Mix',
		'Winston SS Blue',
		'Winston SS Silver',
		'Winston KS Blue',
		'Winston KS Silver',
		'Winston SS Dream Mix',
		'Winston SS Expand Blue',
		'Winston SS Expand Purple',
		'Winston SS Green',
		'Winston SS Violet',
		'Winston XS Blue',
		'Richmond Black',
		'Richmond Gold',
		'Richmond Grand',
		'Richmond Bronze',
		'Richmond Red',
		'Richmond Royal',
		'LD Compact Blue',
		'LD Compact Silver',
		'LD KS Blue',
		'LD SS Pink',
		'LD SS Violet',
		'LD Compact 100s Silver',
		'LD Compact Purple Beat',
		'LD Connect',
		'Бальзам',
		'Esse Mango',
		'Esse SS Blue',
		'Esse Santorini Demi',
		'Esse SS Sense Himalaya',
		'Esse SS Strawbary',
		'Esse SS Exchange W',
		'Esse Special Gold',
		'Parliament Aqua',
		'Parliament Soho',
		'Malboro Red',
	]

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!imageFile || !bought || !given || !day || !month)
			return alert('Заполните все поля')

		const imgRef = storageRef(
			storage,
			`profilesBegimay/${Date.now()}_${imageFile.name}`
		)
		await uploadBytes(imgRef, imageFile)
		const photoUrl = await getDownloadURL(imgRef)

		const currentYear = new Date().getFullYear()
		const fullDate = `${currentYear}-${month}-${day}`
		const profileData = {
			photoUrl,
			bought,
			given,
			createdAt: fullDate,
			usageCount: 1,
			lastUsedAt: null,
			imagePath: imgRef.fullPath,
			lighter,
		}

		await push(dbRef(db, 'profilesBegimay'), profileData)

		setImageFile(null)
		setBought('')
		setGiven('')
		fetchProfiles()
	}

	const fetchProfiles = () => {
		const now = new Date()
		const profilesRef = dbRef(db, 'profilesBegimay')

		onValue(profilesRef, (snapshot) => {
			const data = snapshot.val()
			if (!data) return setProfiles([])

			const result = Object.entries(data)
				.map(([id, p]) => {
					const [year, month, day] = p.createdAt.split('-')
					const createdAt = new Date(
						now.getFullYear(),
						parseInt(month) - 1,
						parseInt(day)
					)

					const lastUsed = p.lastUsedAt ? new Date(p.lastUsedAt) : null
					const daysSinceLastUse = lastUsed
						? (now - lastUsed) / (1000 * 60 * 60 * 24)
						: null

					const canShow = !lastUsed || daysSinceLastUse >= 7

					return {
						id,
						...p,
						createdAt,
						show: canShow,
					}
				})
				.sort((a, b) => b.createdAt - a.createdAt)

			const filtered = result.filter(
				(p) => p.show && (filterBrand === 'Все' || p.given === filterBrand)
			)

			setTotalCount(
				result.filter((p) =>
					filterBrand === 'Все' ? true : p.given === filterBrand
				).length
			)
			setVisibleCount(filtered.length)
			setProfiles(filtered)
		})
	}

	const handleUse = async (profile) => {
		const newCount = (profile.usageCount || 1) + 1

		await update(dbRef(db, `profilesBegimay/${profile.id}`), {
			usageCount: newCount,
			lastUsedAt: new Date().toISOString(),
		})

		fetchProfiles()
	}

	useEffect(() => {
		fetchProfiles()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterBrand])

	const handleBoughtChange = (e) => {
		const value = e.target.value
		setBought(value)
		setGiven(value)
	}

	const handleGivenChange = (e) => {
		setGiven(e.target.value)
	}

	return (
		<div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
			<img src={heart} alt='heart' className='heart' />
			<img src={heart2} alt='heart2' className='heart2' />
			<img src={heart3} alt='heart3' className='heart3' />
			<h1>Добавить анкету</h1>
			<form onSubmit={handleSubmit}>
				<input
					className='hidden-input'
					type='file'
					id='file'
					onChange={(e) => setImageFile(e.target.files[0])}
				/>
				<label for='file' class='custom-upload'>
					Загрузить файл
				</label>
				<div>
					<label className='vybor'>Что купил:</label>
					<select className='btn' value={bought} onChange={handleBoughtChange}>
						<option value=''>Выбери</option>
						{cigarettes.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className='vybor'>Что выдал:</label>
					<select className='btn' value={given} onChange={handleGivenChange}>
						<option value=''>Выбери</option>
						{cigarettes.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
				</div>
				<div>
					<label>
						<input
							type='checkbox'
							checked={lighter}
							onChange={(e) => setLighter(e.target.checked)}
							style={{ marginBottom: '10px' }}
						/>
						Выдавалась зажигалка
					</label>
				</div>
				<div>
					<label>Дата проведения:</label>
					<div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
						<select
							className='btn'
							value={day}
							onChange={(e) => setDay(e.target.value)}
						>
							<option value=''>День</option>
							{[...Array(31)].map((_, i) => (
								<option key={i + 1} value={String(i + 1).padStart(2, '0')}>
									{i + 1}
								</option>
							))}
						</select>

						<select
							className='btn'
							value={month}
							onChange={(e) => setMonth(e.target.value)}
						>
							<option value=''>Месяц</option>
							{[
								'01',
								'02',
								'03',
								'04',
								'05',
								'06',
								'07',
								'08',
								'09',
								'10',
								'11',
								'12',
							].map((m, i) => (
								<option key={m} value={m}>
									{i + 1}
								</option>
							))}
						</select>
					</div>
				</div>
				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<button style={{ textAlign: 'center' }} className='btn' type='submit'>
						Сохранить
					</button>
				</div>
			</form>
			<div
				style={{
					display: 'flex',
					gap: '30px',
					alignItems: 'center',
				}}
			>
				<div>
					<label>Фильтр по марке:</label>
					<select
						style={{ marginTop: '10px' }}
						className='btn'
						value={filterBrand}
						onChange={(e) => setFilterBrand(e.target.value)}
					>
						<option value='Все'>Все</option>
						{cigarettes.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
				</div>
				<div
					style={{
						display: 'flex',
						gap: '20px',
						textAlign: 'center',
						fontSize: '14px',
					}}
				>
					<p>Активные {visibleCount}</p>
					<p>Общее {totalCount}</p>
				</div>
			</div>

			<h2>Доступные анкеты</h2>
			{profilesBegimay.length > 0 ? (
				profilesBegimay.map((p) => (
					<div
						key={p.id}
						style={{
							margin: '10px 0',
							padding: '10px',
							backgroundColor: '#f7a8c9',
							borderRadius: '10px',
						}}
					>
						<img
							src={p.photoUrl}
							alt='Анкета'
							style={{
								width: '100%',
								maxHeight: '100%',
								objectFit: 'cover',
								objectPosition: 'top',
								borderRadius: '10px',
							}}
						/>
						<p>
							<strong>Купил:</strong> {p.bought}
						</p>
						<p>
							<strong>Выдал:</strong> {p.given}
						</p>
						<p>
							<strong>Зажигалка:</strong> {p.lighter ? 'Да' : 'Нет'}
						</p>
						<p>
							<strong>Дата:</strong>{' '}
							{new Date(p.createdAt).toLocaleDateString()}
						</p>
						<p>
							<strong>Использовано:</strong> {p.usageCount}
						</p>
						<button
							className='btn'
							style={{ border: '1px solid black', color: 'black' }}
							onClick={() => handleUse(p)}
						>
							Использовать
						</button>
					</div>
				))
			) : (
				<p>Нет доступных анкет</p>
			)}
		</div>
	)
}

export default App
