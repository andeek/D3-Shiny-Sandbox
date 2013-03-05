GraphMLtoJSON<-function(file){
  require(XML)
  require(rjson)
  
  graph<-xmlRoot(xmlTreeParse(file))[["graph"]]
    
  nodes<-xmlElementsByTagName(graph, "node")
  edges<-xmlElementsByTagName(graph, "edge")
  
  node_list<-list()
  for(i in 1:length(nodes)){
    id<-xmlGetAttr(nodes[[i]], "id")
    data<-xmlElementsByTagName(nodes[[i]], "data")
    data_list<-list()
    for(j in 1:length(data)) {
      data_list[[xmlGetAttr(data[[j]],"key")]]<-xmlValue(data[[j]])  
    }
    node_list[[i]]<-cbind(id, data.frame(data_list))
  }

  edge_list <- lapply(1:length(edges),function(i) c(source=xmlGetAttr(edges[[i]],"source"), target=xmlGetAttr(edges[[i]],"target")))
  
  for(e in 1:length(edge_list)) {
    for(n in 1:length(node_list)) {
      if(edge_list[[e]]["source"] == node_list[[n]]["id"]) 
        edge_list[[e]]["source"] <- as.numeric(n-1)
      if(edge_list[[e]]["target"] == node_list[[n]]["id"])
        edge_list[[e]]["target"] <- as.numeric(n-1)
    }
  }
  
  test.n<-ldply(node_list)
  test.e<-ldply(edge_list)
  e.2<-data.frame(source=apply(test.e, 1, function(x) which(test.n$id == x["source"])-1),
                  target=apply(test.e, 1, function(x) which(test.n$id == x["target"])-1))
  
  edge_list.2<-split(e.2, 1:nrow(e.2))
  
  
  merge_lists<-list()
  merge_lists$nodes<-node_list
  merge_lists$edges<-edge_list.2
  return(toJSON(merge_lists))
}