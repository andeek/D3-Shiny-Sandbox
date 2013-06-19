##converts flight data to proper gml
library(igraph)

countries <- read.csv("Datasets/flights/countriesToCountries.csv", sep=",", header=TRUE)

#check identical
identical(sort(unique(countries$country.departure)), sort(unique(countries$country.arrival)))

graph<-graph.data.frame(countries[,1:2])
E(graph)$weight <- countries[,3]
V(graph)$label <- V(graph)$name

write.graph(graph, "Datasets/flights/countriesNetwork_ak.gml", format="gml")
