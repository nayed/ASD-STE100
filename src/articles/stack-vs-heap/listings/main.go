package main

import "fmt"

type point struct{ x, y int }

// p stays inside the function: the compiler keeps it on the stack
func sum() int {
	p := point{1, 2}
	return p.x + p.y
}

// the address of p leaves the function: p must live on the heap
func newPoint() *point {
	p := point{3, 4}
	return &p
}

func main() {
	fmt.Println(sum(), *newPoint())
}
