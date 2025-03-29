import type { Meta, StoryObj } from "@storybook/react"

import { QuickTime } from "./quick-time"

const meta = {
  title: "Quick TIme",
  component: QuickTime,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Object>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {},
}
