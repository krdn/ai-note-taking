import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Typography from '@tiptap/extension-typography'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

export const extensions = [
  StarterKit.configure({
    codeBlock: false,
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return '제목을 입력하세요...'
      }
      return '내용을 입력하거나 / 를 눌러 명령어를 사용하세요...'
    },
  }),
  Highlight.configure({
    multicolor: true,
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-primary underline underline-offset-2 cursor-pointer',
    },
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Typography,
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: 'javascript',
  }),
]
