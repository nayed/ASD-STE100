package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	var wg sync.WaitGroup           // waits for a set of goroutines
	results := make(chan string, 3) // capacity 3 = 3 workers: no send blocks

	for i := 1; i <= 3; i++ {
		// wg.Go (Go 1.25+) starts the goroutine and tracks it;
		// since Go 1.22 each iteration has its own i, safe to capture
		wg.Go(func() {
			time.Sleep(time.Millisecond) // simulate work
			results <- fmt.Sprintf("worker %d done", i)
		})
	}

	wg.Wait()
	close(results)             // the sending side closes
	for msg := range results { // drains, then stops at the close
		fmt.Println(msg)
	}
}
