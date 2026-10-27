package main

import "fmt"

func main() {
	// array — fixed size, rarely used directly
	var grid [4]int

	// slice — grows with append
	scores := []int{90, 85, 77}
	scores = append(scores, 99)

	// slicing: half-open range [1:3]
	top := scores[1:3] // 85, 77 — shares memory with scores

	// map — reference type, must be made before use
	ages := map[string]int{"ada": 36, "grace": 45}
	ages["linus"] = 24

	// the comma-ok idiom: absent vs. present-with-zero-value
	v, ok := ages["turing"] // 0, false

	_ = grid
	fmt.Println(len(scores), top, v, ok)
}
