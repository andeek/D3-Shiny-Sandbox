library(igraph)
books.gr <- read.graph("Datasets/polbooks/polbooks.gml", format="gml")
books.df <- get.data.frame(football.gr, what="vertices")