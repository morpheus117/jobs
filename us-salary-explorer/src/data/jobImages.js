/**
 * Maps each occupation title to its local image file and Unsplash attribution.
 * Images are stored in /public/images/jobs/ and served as static assets.
 * All photos are sourced from Unsplash under the Unsplash License (free for commercial use).
 * https://unsplash.com/license
 */
const jobImages = {
  'Software Developers': {
    file: 'software-developers.jpg',
    alt: 'Person coding on a laptop',
    photographer: 'Christopher Gower',
    photographerUrl: 'https://unsplash.com/@cgower',
    photoUrl: 'https://unsplash.com/photos/m_HRfLhgABo',
  },
  'Registered Nurses': {
    file: 'registered-nurses.jpg',
    alt: 'Nurse in a hospital setting',
    photographer: 'National Cancer Institute',
    photographerUrl: 'https://unsplash.com/@nci',
    photoUrl: 'https://unsplash.com/photos/701-FJcjLAQ',
  },
  'General and Operations Managers': {
    file: 'general-operations-managers.jpg',
    alt: 'Business team in a meeting',
    photographer: 'Brooke Cagle',
    photographerUrl: 'https://unsplash.com/@brookecagle',
    photoUrl: 'https://unsplash.com/photos/g1Kr4Ozfoac',
  },
  'Accountants and Auditors': {
    file: 'accountants-auditors.jpg',
    alt: 'Person reviewing financial documents',
    photographer: 'Towfiqu barbhuiya',
    photographerUrl: 'https://unsplash.com/@towfiqu999999',
    photoUrl: 'https://unsplash.com/photos/jpqyfK7GB4w',
  },
  'Elementary School Teachers': {
    file: 'elementary-school-teachers.jpg',
    alt: 'Teacher in a classroom with students',
    photographer: 'National Cancer Institute',
    photographerUrl: 'https://unsplash.com/@nci',
    photoUrl: 'https://unsplash.com/photos/BVr3XaBiM9Y',
  },
  'Retail Salespersons': {
    file: 'retail-salespersons.jpg',
    alt: 'Retail clothing store',
    photographer: 'Artificial Photography',
    photographerUrl: 'https://unsplash.com/@artificialphotography',
    photoUrl: 'https://unsplash.com/photos/zebS5p_MnYo',
  },
  'Customer Service Representatives': {
    file: 'customer-service-representatives.jpg',
    alt: 'Customer service representative with headset',
    photographer: 'Pavan Trikutam',
    photographerUrl: 'https://unsplash.com/@ptrikutam',
    photoUrl: 'https://unsplash.com/photos/71CjSSB83Wo',
  },
  'Heavy and Tractor-Trailer Truck Drivers': {
    file: 'truck-drivers.jpg',
    alt: 'Semi truck on a highway',
    photographer: 'Rhys Moult',
    photographerUrl: 'https://unsplash.com/@rhysatwork',
    photoUrl: 'https://unsplash.com/photos/2LJ4rqK2qfU',
  },
  'Lawyers': {
    file: 'lawyers.jpg',
    alt: 'Lawyer at desk with law books',
    photographer: 'Tingey Injury Law Firm',
    photographerUrl: 'https://unsplash.com/@tingeyinjurylawfirm',
    photoUrl: 'https://unsplash.com/photos/DZpc4UY8ZtY',
  },
  'Marketing Managers': {
    file: 'marketing-managers.jpg',
    alt: 'Marketing analytics on a laptop screen',
    photographer: 'Austin Distel',
    photographerUrl: 'https://unsplash.com/@austindistel',
    photoUrl: 'https://unsplash.com/photos/744oGeqpxPQ',
  },
  'Financial Analysts': {
    file: 'financial-analysts.jpg',
    alt: 'Financial charts and data analysis',
    photographer: 'Maxim Hopman',
    photographerUrl: 'https://unsplash.com/@nampoh',
    photoUrl: 'https://unsplash.com/photos/IayKLkmz6g0',
  },
  'Mechanical Engineers': {
    file: 'mechanical-engineers.jpg',
    alt: 'Engineer reviewing technical blueprints',
    photographer: 'ThisisEngineering RAEng',
    photographerUrl: 'https://unsplash.com/@thisisengineering',
    photoUrl: 'https://unsplash.com/photos/8oR0ZiIuMpY',
  },
  'Electricians': {
    file: 'electricians.jpg',
    alt: 'Electrician working with electrical wiring',
    photographer: 'Tima Miroshnichenko',
    photographerUrl: 'https://unsplash.com/@tima_miroshnichenko',
    photoUrl: 'https://unsplash.com/photos/5307663',
  },
  'Construction Laborers': {
    file: 'construction-laborers.jpg',
    alt: 'Construction workers on a building site',
    photographer: 'Scott Blake',
    photographerUrl: 'https://unsplash.com/@sunburned_surveyor',
    photoUrl: 'https://unsplash.com/photos/x-ghf9LjrVg',
  },
  'Physicians and Surgeons, All Other': {
    file: 'physicians-surgeons.jpg',
    alt: 'Physician in a hospital corridor',
    photographer: 'Olga Guryanova',
    photographerUrl: 'https://unsplash.com/@designer4u',
    photoUrl: 'https://unsplash.com/photos/ft7vJxwl2RY',
  },
}

export default jobImages
