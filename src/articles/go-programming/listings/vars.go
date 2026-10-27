package main

import "fmt"

func main() {
	// var — explicit type, starts at its zero value (0)
	var counter int

	// := — declare and infer, inside functions only
	ratio := 3.14
	lang := "go"
	ok := true

	counter++
	fmt.Println(counter, ratio, lang, ok)
	// 1 3.14 go true
}
