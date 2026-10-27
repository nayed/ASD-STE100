// if may take a short statement; its scope ends with the block
if err := risky(); err != nil {
	return err
}

// for is the ONLY loop keyword — it plays every role
for i := 0; i < 10; i++ { } // counted
for x < 100 { }             // "while"
for { }                     // forever — break to exit
for range 10 { }            // ten times, no counter (Go 1.22+)

for i, v := range items {   // index and value
	fmt.Println(i, v)
}

// switch — no implicit fallthrough, no break needed
switch os := runtime.GOOS; os {
case "darwin", "linux":
	fmt.Println("unix lineage")
default:
	fmt.Println("somewhere else")
}
