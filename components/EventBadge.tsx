interface EventBadgeProps {
  condition: string
}

export function EventBadge({ condition }: EventBadgeProps) {
  // Generate a color based on the condition string
  const generateColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const color = Math.floor(Math.abs(Math.sin(hash) * 16777215) % 16777215).toString(16)
    return "#" + "0".repeat(6 - color.length) + color
  }

  const bgColor = generateColor(condition)

  return <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bgColor }} title={condition}></div>
}

