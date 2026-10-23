import test from 'node:test'
import assert from 'node:assert/strict'
import {
  allTranslated,
  declaredLocales,
  extractText,
  hasEnglishVersion,
  PRIMARY_FIELDS,
  serviceNodeKeys,
  untranslatedRobotsMeta,
} from './localeAvailability'

const lexical = (text: string) => ({
  root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text, format: 0 }] }] },
})
const F = PRIMARY_FIELDS.posts

test('en rỗng → chưa có bản en', () => {
  const vi = { title: 'Dịch vụ kế toán trọn gói', excerpt: 'Mô tả ngắn cho dịch vụ này', content: lexical('Nội dung bài viết dài hơn bốn từ') }
  assert.equal(hasEnglishVersion(vi, { title: '', excerpt: null, content: null }, F), false)
  assert.equal(hasEnglishVersion(vi, undefined, F), false)
})

test('en chép nguyên vi → chưa có', () => {
  const vi = { title: 'Dịch vụ kế toán trọn gói', excerpt: 'Mô tả ngắn cho dịch vụ này', content: lexical('Nội dung bài viết dài hơn bốn từ') }
  assert.equal(hasEnglishVersion(vi, { ...vi }, F), false)
})

test('en dịch title nhưng body chép vi → chưa có', () => {
  const vi = { title: 'Dịch vụ kế toán trọn gói', excerpt: 'Mô tả ngắn cho dịch vụ này', content: lexical('Nội dung bài viết dài hơn bốn từ') }
  const en = { title: 'Full accounting service', excerpt: 'A short description of this service', content: lexical('Nội dung bài viết dài hơn bốn từ') }
  assert.equal(hasEnglishVersion(vi, en, F), false)
})

test('dịch đủ mọi field → có', () => {
  const vi = { title: 'Dịch vụ kế toán trọn gói', excerpt: 'Mô tả ngắn cho dịch vụ này', content: lexical('Nội dung bài viết dài hơn bốn từ') }
  const en = { title: 'Full accounting service', excerpt: 'A short description of this service', content: lexical('Article body in English') }
  assert.equal(hasEnglishVersion(vi, en, F), true)
})

test('field vi ngắn ≤3 từ trùng en → vẫn có', () => {
  const vi = { title: 'HiAcc', excerpt: 'Mô tả ngắn cho dịch vụ này', content: null }
  const en = { title: 'HiAcc', excerpt: 'A short description of this service', content: null }
  assert.equal(hasEnglishVersion(vi, en, F), true)
})

test('field vi rỗng thì không đòi en', () => {
  assert.equal(hasEnglishVersion({ title: 'Kế toán', excerpt: '' }, { title: 'Accounting' }, F), true)
})

test('khối body: chữ lồng nhau được rút, cấu trúc thì không', () => {
  const body = [
    { id: 'a', blockType: 'bulletList', title: 'Quyền lợi', items: [{ id: 'x', text: 'Một hai ba bốn' }] },
    { id: 'b', blockType: 'richTextBlock', content: lexical('Đoạn văn') },
  ]
  assert.equal(extractText(body), 'Quyền lợi Một hai ba bốn Đoạn văn')
  const en = [
    { id: 'c', blockType: 'bulletList', title: 'Benefits', items: [{ id: 'y', text: 'One two three four' }] },
    { id: 'd', blockType: 'richTextBlock', content: lexical('Paragraph') },
  ]
  const fields = PRIMARY_FIELDS['service-nodes']
  assert.equal(hasEnglishVersion({ title: 'Kế toán', summary: 'Tóm tắt', body }, { title: 'Accounting', summary: 'Summary', body: en }, fields), true)
  assert.equal(hasEnglishVersion({ title: 'Kế toán', summary: 'Tóm tắt', body }, { title: 'Accounting', summary: 'Summary', body }, fields), false)
})

test('trang nhóm đòi cả con đầu tiên', () => {
  const keys = serviceNodeKeys({ id: 'g', children: [{ id: 'c1' }, { id: 'c2' }] })
  assert.deepEqual(keys, ['g', 'c1'])
  assert.equal(allTranslated(keys, new Set(['g'])), false)
  assert.equal(allTranslated(keys, new Set(['g', 'c1'])), true)
  assert.deepEqual(serviceNodeKeys({ id: 'leaf', children: [] }), ['leaf'])
})

test('hreflang/sitemap: chưa có en thì không khai en, vẫn giữ vi', () => {
  assert.deepEqual(declaredLocales(['vi', 'en'], true), ['vi', 'en'])
  assert.deepEqual(declaredLocales(['vi', 'en'], false), ['vi'])
})

test('robots: en chưa dịch → noindex,follow', () => {
  assert.deepEqual(untranslatedRobotsMeta('en', false, false), { robots: { index: false, follow: true } })
})
test('robots: en chưa dịch trên staging → noindex,nofollow', () => {
  assert.deepEqual(untranslatedRobotsMeta('en', false, true), { robots: { index: false, follow: false } })
})
test('robots: en đã dịch hoặc vi → không override', () => {
  assert.deepEqual(untranslatedRobotsMeta('en', true, false), {})
  assert.deepEqual(untranslatedRobotsMeta('vi', false, false), {})
  assert.deepEqual(untranslatedRobotsMeta('vi', true, false), {})
})
