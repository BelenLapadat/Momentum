import type { TimelineEvent } from '../types'
import { formatEventDate } from './chronology'

export async function downloadEventDocx(event: TimelineEvent): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')
  const dateLabel = formatEventDate(event)
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: event.title,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: dateLabel,
                italics: true,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          ...((event.body ?? '').split('\n').map(
            (line) =>
              new Paragraph({
                children: [new TextRun(line || ' ')],
              }),
          )),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFilename(event.title) || 'event'}.docx`
  a.click()
  URL.revokeObjectURL(url)
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\- ]+/g, '').trim().slice(0, 80)
}
