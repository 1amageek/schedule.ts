# schedule.ts

## Usage

```tsx
	<Table
		initialData={[]}
		idProvider={uuidv4}
		onCreate={(item, done) => {
			alert("save?")
			done(item)
		}}
		onDelete={(item, done) => {
			alert("delete?")
			done(item)
		}}
	>
		<Card>
			{data => {
				return (
					<div
						style={{
							padding: "8px"
						}}
					>{data.id}</div>
				)
			}}
		</Card>
	</Table>
```

