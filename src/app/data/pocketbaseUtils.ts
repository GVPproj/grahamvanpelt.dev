import PocketBase from 'pocketbase'
const pb = new PocketBase(process.env.POCKETBASE_URL)

export const getPb = () => {
  return pb
}
