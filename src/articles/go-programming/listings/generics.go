package main

import (
	"cmp"
	"fmt"
)

// T is a type parameter; cmp.Ordered is its constraint
// (min and max are built in since Go 1.21 — this is for illustration)
func Max[T cmp.Ordered](a, b T) T {
	if a > b {
		return a
	}
	return b
}

// a generic type: a stack of any element type
type Stack[T any] struct {
	items []T
}

func (s *Stack[T]) Push(v T) { s.items = append(s.items, v) }

func main() {
	fmt.Println(Max(3, 7))      // 7 — T inferred as int
	fmt.Println(Max("go", "c")) // go — T inferred as string

	var names Stack[string]
	names.Push("gopher")
	fmt.Println(len(names.items)) // 1
}
